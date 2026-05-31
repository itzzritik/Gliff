import { type DotLottie, DotLottieReact } from "@lottiefiles/dotlottie-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import {
	PLAYGROUND_LOTTIE_IMPORT_URL,
	playgroundLottieUrl as lottieUrl,
} from "../assets";
import { useUrlState } from "../useUrlState";
import { useLottieIndex } from "../useLottieIndex";
import { type LFItem, useLottieFiles } from "../useLottieFiles";
import styles from "./Lottie.module.css";
import { Card, Preview, Scrubber, SearchBar, SectionHead, Spinner } from "./shared";
import shared from "./shared.module.css";

const DEFAULT_LOTTIE = "SpacemanHappy";
const DEFAULT_SRC = lottieUrl(DEFAULT_LOTTIE);

const ASSETS_LOTTIE_RE = /\/anim\/lottie\/([^/]+)\.lottie$/;
const FILE_EXT_RE = /\.(lottie|json)$/i;

const SIZE_MIN = 64;
const SIZE_MAX = 480;
const SIZE_TICKS = [64, 120, 180, 240, 320, 400, 480];
const SPEED_TICKS = [0.25, 0.5, 1, 1.5, 2, 3];

type Tab = "library" | "lottiefiles";

const TABS: { id: Tab; label: string }[] = [
	{ id: "library", label: "Library" },
	{ id: "lottiefiles", label: "LottieFiles" },
];

const isLottieFilesUrl = (src: string): boolean =>
	src.includes("lottie.host") || src.includes("lottiefiles.com");

const toLabel = (name: string): string =>
	name
		.replace(/[-_]+/g, " ")
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/([a-zA-Z])(\d)/g, "$1 $2")
		.replace(/\s+/g, " ")
		.trim()
		.split(" ")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");

interface DLBus {
	addEventListener: (type: string, cb: (e: never) => void) => void;
	removeEventListener: (type: string, cb: (e: never) => void) => void;
	setFrame: (f: number) => void;
}

const asBus = (dl: DotLottie) => dl as unknown as DLBus;

const useDebounce = <T,>(value: T, delay: number) => {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const t = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(t);
	}, [value, delay]);
	return debounced;
};

type ImportResult =
	| { ok: true; slug: string; files: string[] }
	| { ok: false; status: number; reason: string; signInUrl?: string };

const importLottie = async (
	slug: string,
	dotLottieUrl: string,
): Promise<ImportResult> => {
	const res = await fetch(PLAYGROUND_LOTTIE_IMPORT_URL, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ slug, dotLottieUrl }),
	});
	const body = (await res.json().catch(() => ({}))) as {
		ok?: true;
		slug?: string;
		files?: string[];
		reason?: string;
		signInUrl?: string;
	};
	if (res.ok && body.ok) {
		return { ok: true, slug: body.slug ?? slug, files: body.files ?? [] };
	}
	return {
		ok: false,
		status: res.status,
		reason: body.reason ?? res.statusText,
		signInUrl: body.signInUrl,
	};
};

export const LottieWorkbench = () => {
	const { files, addLocal, replace } = useLottieIndex();
	// Library slug persists in the URL (so deep-links to a curated lottie work).
	// Any non-library src (LottieFiles card, pasted custom URL) lives only in memory —
	// reloading the page resets to the default library card.
	const [librarySlug, setLibrarySlug] = useUrlState("lottie", DEFAULT_LOTTIE);
	const [overrideSrc, setOverrideSrc] = useState<string | null>(null);
	const src = overrideSrc ?? lottieUrl(librarySlug);
	const setSrc = useCallback(
		(next: string) => {
			const match = next.match(ASSETS_LOTTIE_RE);
			if (match) {
				setOverrideSrc(null);
				setLibrarySlug(match[1]);
			} else {
				setOverrideSrc(next);
				setLibrarySlug(DEFAULT_LOTTIE);
			}
		},
		[setLibrarySlug],
	);
	const [size, setSize] = useState(240);
	const [speed, setSpeed] = useState(1);
	const [loop, setLoop] = useState(true);
	const [autoplay, setAutoplay] = useState(true);
	const [tab, setTab] = useState<Tab>("library");
	const [query, setQuery] = useState("");
	const debouncedQuery = useDebounce(query, 350);

	const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
	const [frame, setFrame] = useState(0);
	const [totalFrames, setTotalFrames] = useState(0);
	const [duration, setDuration] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [previewReady, setPreviewReady] = useState(false);

	const lfMode: "featured" | "search" = debouncedQuery ? "search" : "featured";
	const lfState = useLottieFiles({
		tab: lfMode,
		query: lfMode === "search" ? debouncedQuery : undefined,
		enabled: tab === "lottiefiles",
	});

	const [activeLfItem, setActiveLfItem] = useState<LFItem | null>(null);
	const [importing, setImporting] = useState(false);

	useEffect(() => {
		const t = setTimeout(() => setPreviewReady(true), 1500);
		return () => clearTimeout(t);
	}, []);

	useEffect(() => {
		if (!(previewReady && dotLottie && autoplay)) return;
		dotLottie.play();
	}, [previewReady, dotLottie, autoplay]);

	useEffect(() => {
		if (!dotLottie) return;
		setError(null);
		const onLoad = () => {
			setTotalFrames(dotLottie.totalFrames || 0);
			setDuration(dotLottie.duration || 0);
		};
		const onFrame = (e: { currentFrame: number }) => {
			const next = Math.round(e.currentFrame);
			setFrame((prev) => (prev === next ? prev : next));
		};
		const onPlay = () => setPlaying(true);
		const onPause = () => setPlaying(false);
		const onStop = () => setPlaying(false);
		const onError = (e: { error: { message?: string } }) =>
			setError(e.error?.message ?? "Failed to load");

		const bus = asBus(dotLottie);
		const handlers: [string, (e: never) => void][] = [
			["load", onLoad as never],
			["frame", onFrame as never],
			["play", onPlay as never],
			["pause", onPause as never],
			["stop", onStop as never],
			["loadError", onError as never],
		];
		for (const [t, cb] of handlers) bus.addEventListener(t, cb);
		return () => {
			for (const [t, cb] of handlers) bus.removeEventListener(t, cb);
		};
	}, [dotLottie]);

	const handleSeek = useCallback(
		(f: number) => {
			if (dotLottie) asBus(dotLottie).setFrame(f);
		},
		[dotLottie],
	);

	const togglePlay = useCallback(() => {
		if (!dotLottie) return;
		if (playing) dotLottie.pause();
		else dotLottie.play();
	}, [dotLottie, playing]);

	const stop = useCallback(() => {
		dotLottie?.stop();
	}, [dotLottie]);

	const progress = totalFrames > 0 ? (frame / totalFrames) * 100 : 0;

	const lottieName = useMemo(() => {
		const match = src.match(ASSETS_LOTTIE_RE);
		if (match) return toLabel(match[1]);
		if (activeLfItem && activeLfItem.dotLottieUrl === src) return activeLfItem.name;
		const last = src.split("/").pop() ?? "";
		return last.replace(FILE_EXT_RE, "") || "Custom";
	}, [src, activeLfItem]);

	const indexedSlugs = useMemo(() => new Set(files ?? []), [files]);

	const previewMeta = [
		lottieName,
		`${size}px`,
		duration ? `${duration.toFixed(2)}s` : null,
		totalFrames ? `${totalFrames}f` : null,
		`${speed.toFixed(2)}x`,
	];

	const isLfSrc = isLottieFilesUrl(src);
	const importableItem = activeLfItem && activeLfItem.dotLottieUrl === src
		? activeLfItem
		: null;
	const alreadyImported = importableItem
		? indexedSlugs.has(importableItem.slug)
		: false;
	const showImport = isLfSrc && importableItem && !alreadyImported;

	const onImport = useCallback(async () => {
		if (!importableItem) return;
		setImporting(true);
		try {
			const result = await importLottie(
				importableItem.slug,
				importableItem.dotLottieUrl,
			);
			if (result.ok) {
				if (result.files.length) replace(result.files);
				else addLocal(result.slug);
			} else if (result.status === 401 && result.signInUrl) {
				window.open(result.signInUrl, "_blank", "noopener");
			} else if (result.status === 409) {
				addLocal(importableItem.slug);
			}
		} finally {
			setImporting(false);
		}
	}, [importableItem, addLocal, replace]);

	const handlePick = useCallback(
		(url: string, item?: LFItem) => {
			setSrc(url);
			setActiveLfItem(item ?? null);
		},
		[setSrc],
	);

	const headerAction = showImport ? (
		<HeaderActionButton disabled={importing} onClick={onImport}>
			{importing ? <Spinner label="Importing" size={12} /> : <ImportIcon />}
			{importing ? "Saving…" : "Import"}
		</HeaderActionButton>
	) : null;

	return (
		<div className={shared.workbench}>
			<aside className={shared.sidebar}>
				<Preview
					footer={
						<>
							<Transport
								frame={frame}
								onSeek={handleSeek}
								onStop={stop}
								onToggle={togglePlay}
								playing={playing}
								progress={progress}
								totalFrames={totalFrames}
							/>
							<MediaControls
								autoplay={autoplay}
								loop={loop}
								setAutoplay={setAutoplay}
								setLoop={setLoop}
								setSpeed={setSpeed}
								speed={speed}
							/>
						</>
					}
					headerAction={headerAction}
					meta={previewMeta}
					title="Preview"
				>
					<div
						className={styles.playerInner}
						style={{ height: `${size}px`, width: `${size}px` }}
					>
						{error ? (
							<div className={styles.errBox}>
								<span className={styles.errLabel}>LOAD ERROR</span>
								<span className={styles.errMsg}>{error}</span>
							</div>
						) : (
							<DotLottieReact
								autoplay={previewReady && autoplay}
								className={styles.player}
								dotLottieRefCallback={setDotLottie}
								key={src}
								loop={loop}
								speed={speed}
								src={src}
							/>
						)}
					</div>
				</Preview>

				<Scrubber
					label="Lottie size"
					max={SIZE_MAX}
					min={SIZE_MIN}
					onChange={setSize}
					ticks={SIZE_TICKS}
					value={size}
				/>

				<div className={styles.urlInput}>
					<input
						className={styles.urlField}
						onChange={(e) => handlePick(e.target.value)}
						placeholder="https://lottie.host/…"
						spellCheck={false}
						type="text"
						value={src}
					/>
					<button
						aria-label="Copy URL"
						className={styles.urlClear}
						onClick={() => navigator.clipboard.writeText(src)}
						title="Copy URL"
						type="button"
					>
						<CopyIcon />
					</button>
					<button
						aria-label="Reset to default"
						className={styles.urlClear}
						onClick={() => handlePick(DEFAULT_SRC)}
						title="Reset"
						type="button"
					>
						<ResetIcon />
					</button>
				</div>
			</aside>

			<section className={shared.canvas}>
				<div className={cn(shared.section, shared.sectionGrow)}>
					<SectionHead
						action={<TabStrip onChange={setTab} tab={tab} />}
						title={tab === "library" ? "Library" : "LottieFiles"}
					>
						{tab === "library" ? (
							<>
								Pick a lottie from the Gliff library, or paste any remote URL into{" "}
								<em>src</em>.
							</>
						) : (
							"Browse and import animations from LottieFiles. Imports land in the Library instantly."
						)}
					</SectionHead>
					<LottieGrid
						indexedSlugs={indexedSlugs}
						libraryFiles={files}
						lfItems={lfState.items}
						lfLoadMore={lfState.loadMore}
						lfLoading={lfState.loading}
						lfNextCursor={lfState.nextCursor}
						onPick={handlePick}
						query={query}
						setQuery={setQuery}
						src={src}
						tab={tab}
					/>
				</div>
			</section>
		</div>
	);
};

const TabStrip = ({
	tab,
	onChange,
}: {
	tab: Tab;
	onChange: (next: Tab) => void;
}) => (
	<div className={styles.libTabs}>
		<div
			aria-hidden="true"
			className={styles.libTabIndicator}
			data-tab={tab}
		/>
		{TABS.map((t) => (
			<button
				className={cn(styles.libTab, tab === t.id && styles.libTabActive)}
				key={t.id}
				onClick={() => onChange(t.id)}
				type="button"
			>
				{t.label}
			</button>
		))}
	</div>
);

const LottieGrid = ({
	tab,
	src,
	onPick,
	query,
	setQuery,
	libraryFiles,
	lfItems,
	lfLoading,
	lfNextCursor,
	lfLoadMore,
	indexedSlugs,
}: {
	tab: Tab;
	src: string;
	onPick: (url: string, item?: LFItem) => void;
	query: string;
	setQuery: (q: string) => void;
	libraryFiles: string[] | null;
	lfItems: LFItem[];
	lfLoading: boolean;
	lfNextCursor: string | null;
	lfLoadMore: () => void;
	indexedSlugs: Set<string>;
}) => {
	const sentinelRef = useRef<HTMLDivElement>(null);

	const libraryVisible = useMemo(() => {
		if (!libraryFiles) return [];
		const q = query.toLowerCase().trim();
		if (!q) return libraryFiles;
		return libraryFiles.filter((name) => name.toLowerCase().includes(q));
	}, [libraryFiles, query]);

	const itemsLength = tab === "library" ? libraryVisible.length : lfItems.length;
	const totalLibrary = libraryFiles?.length ?? 0;
	const libraryLoading = libraryFiles === null;

	useEffect(() => {
		if (tab !== "lottiefiles") return;
		const el = sentinelRef.current;
		if (!(el && lfNextCursor) || lfLoading) return;
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) lfLoadMore();
			},
			{ rootMargin: "200px" },
		);
		io.observe(el);
		return () => io.disconnect();
	}, [tab, lfNextCursor, lfLoading, lfLoadMore]);

	const placeholder = tab === "library"
		? "Filter lotties by name…"
		: "Search LottieFiles…";
	const total = tab === "library"
		? totalLibrary
		: itemsLength + (lfNextCursor ? 1 : 0);

	return (
		<>
			<SearchBar
				matched={itemsLength}
				onChange={setQuery}
				placeholder={placeholder}
				total={total}
				value={query}
			/>
			<div className={cn(shared.gridFrame, shared.gridFrameScroll)}>
				<GridBody
					indexedSlugs={indexedSlugs}
					itemsLength={itemsLength}
					lfItems={lfItems}
					lfLoading={lfLoading}
					libraryLoading={libraryLoading}
					libraryVisible={libraryVisible}
					onPick={onPick}
					query={query}
					sentinelRef={sentinelRef}
					showSentinel={tab === "lottiefiles" && Boolean(lfNextCursor)}
					src={src}
					tab={tab}
				/>
			</div>
		</>
	);
};

const GridBody = ({
	tab,
	src,
	onPick,
	itemsLength,
	libraryVisible,
	lfItems,
	libraryLoading,
	lfLoading,
	indexedSlugs,
	query,
	sentinelRef,
	showSentinel,
}: {
	tab: Tab;
	src: string;
	onPick: (url: string, item?: LFItem) => void;
	itemsLength: number;
	libraryVisible: string[];
	lfItems: LFItem[];
	libraryLoading: boolean;
	lfLoading: boolean;
	indexedSlugs: Set<string>;
	query: string;
	sentinelRef: React.RefObject<HTMLDivElement | null>;
	showSentinel: boolean;
}) => {
	if (tab === "library" && libraryLoading) {
		return (
			<div className={shared.gridEmpty}>
				<Spinner label="Loading library" size={20} />
			</div>
		);
	}
	if (itemsLength === 0) {
		if (tab === "lottiefiles" && lfLoading) {
			return (
				<div className={shared.gridEmpty}>
					<Spinner label="Loading animations" size={20} />
				</div>
			);
		}
		const msg = query ? (
			<>
				No matches for <em>"{query}"</em>
			</>
		) : (
			"No results."
		);
		return <div className={shared.gridEmpty}>{msg}</div>;
	}

	return (
		<>
			<div className={shared.gridGrid}>
				{tab === "library"
					? libraryVisible.map((name) => (
							<LibraryCard
								active={src === lottieUrl(name)}
								key={name}
								name={name}
								onClick={() => onPick(lottieUrl(name))}
							/>
						))
					: lfItems.map((it) => (
							<LottieFilesCard
								active={src === it.dotLottieUrl}
								inLibrary={indexedSlugs.has(it.slug)}
								item={it}
								key={it.id}
								onClick={() => onPick(it.dotLottieUrl, it)}
							/>
						))}
			</div>
			{showSentinel ? <div ref={sentinelRef} style={{ height: 1 }} /> : null}
			{tab === "lottiefiles" && lfLoading ? (
				<div className={shared.gridEmpty}>
					<Spinner label="Loading more" size={18} />
				</div>
			) : null}
		</>
	);
};

const LibraryCard = memo(({
	name,
	active,
	onClick,
}: {
	name: string;
	active: boolean;
	onClick: () => void;
}) => {
	const dlRef = useRef<DotLottie | null>(null);

	const seekMid = useCallback(() => {
		const dl = dlRef.current;
		const total = dl?.totalFrames || 0;
		if (dl && total > 0) dl.setFrame(Math.floor(total / 2));
	}, []);

	const attachedRef = useRef<DotLottie | null>(null);
	const handleRef = useCallback(
		(dl: DotLottie | null) => {
			dlRef.current = dl;
			if (!dl || attachedRef.current === dl) return;
			attachedRef.current = dl;
			dl.addEventListener("load", () => {
				dl.play();
				requestAnimationFrame(() => {
					dl.pause();
					seekMid();
				});
			});
		},
		[seekMid],
	);

	return (
		<Card
			active={active}
			icon={
				<div className={styles.lottieMini}>
					<DotLottieReact
						autoplay={false}
						className={styles.lottiePlayer}
						dotLottieRefCallback={handleRef}
						loop
						src={lottieUrl(name)}
					/>
				</div>
			}
			label={toLabel(name)}
			onClick={onClick}
			onMouseEnter={() => dlRef.current?.play()}
			onMouseLeave={() => {
				dlRef.current?.pause();
				seekMid();
			}}
			title={name}
		/>
	);
});
LibraryCard.displayName = "LibraryCard";

const LottieFilesCard = memo(({
	item,
	active,
	inLibrary,
	onClick,
}: {
	item: LFItem;
	active: boolean;
	inLibrary: boolean;
	onClick: () => void;
}) => {
	const [hovering, setHovering] = useState(false);

	return (
		<Card
			active={active}
			icon={
				<div className={styles.lottieMini}>
					{hovering ? (
						<DotLottieReact
							autoplay
							className={styles.lottiePlayer}
							loop
							src={item.dotLottieUrl}
						/>
					) : item.thumbnailUrl ? (
						<img
							alt=""
							className={styles.lottieThumb}
							height={48}
							loading="lazy"
							src={item.thumbnailUrl}
							width={48}
						/>
					) : (
						<div className={styles.lottiePlayer} />
					)}
				</div>
			}
			label={item.name}
			meta={inLibrary ? "In Library" : undefined}
			onClick={onClick}
			onMouseEnter={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}
			title={item.slug}
		/>
	);
});
LottieFilesCard.displayName = "LottieFilesCard";

const HeaderActionButton = ({
	children,
	onClick,
	disabled,
}: {
	children: React.ReactNode;
	onClick: () => void;
	disabled?: boolean;
}) => (
	<button
		className={styles.headerAction}
		disabled={disabled}
		onClick={onClick}
		type="button"
	>
		{children}
	</button>
);

const PlayIcon = () => (
	<svg
		aria-hidden="true"
		fill="currentColor"
		height="16"
		viewBox="0 0 16 16"
		width="16"
	>
		<path d="M3 2 L13 8 L3 14 Z" />
	</svg>
);
const PauseIcon = () => (
	<svg
		aria-hidden="true"
		fill="currentColor"
		height="16"
		viewBox="0 0 16 16"
		width="16"
	>
		<rect height="12" rx="0.5" width="3.5" x="3" y="2" />
		<rect height="12" rx="0.5" width="3.5" x="9.5" y="2" />
	</svg>
);
const StopIcon = () => (
	<svg
		aria-hidden="true"
		fill="currentColor"
		height="12"
		viewBox="0 0 16 16"
		width="12"
	>
		<rect height="12" rx="1" width="12" x="2" y="2" />
	</svg>
);

interface TransportProps {
	playing: boolean;
	onToggle: () => void;
	onStop: () => void;
	frame: number;
	totalFrames: number;
	progress: number;
	onSeek: (f: number) => void;
}

const Transport = ({
	frame,
	onSeek,
	onStop,
	onToggle,
	playing,
	progress,
	totalFrames,
}: TransportProps) => {
	const trackRef = useRef<HTMLDivElement>(null);

	const seekFromEvent = (e: React.PointerEvent) => {
		const r = trackRef.current?.getBoundingClientRect();
		if (!r) return;
		const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
		onSeek(Math.round(pct * (totalFrames - 1)));
	};

	return (
		<div className={styles.transport}>
			<button
				aria-label={playing ? "Pause" : "Play"}
				className={styles.playBtn}
				onClick={onToggle}
				type="button"
			>
				{playing ? <PauseIcon /> : <PlayIcon />}
			</button>
			<button
				aria-label="Stop"
				className={styles.stopBtn}
				onClick={onStop}
				type="button"
			>
				<StopIcon />
			</button>
			<div
				className={styles.timeline}
				onPointerDown={(e) => {
					(e.target as HTMLElement).setPointerCapture(e.pointerId);
					seekFromEvent(e);
				}}
				onPointerMove={(e) => {
					if (e.buttons === 1) seekFromEvent(e);
				}}
				ref={trackRef}
			>
				<div
					className={styles.timelineFill}
					style={{ width: `${progress}%` }}
				/>
				<div
					className={styles.timelineHead}
					style={{ left: `${progress}%` }}
				/>
			</div>
			<span className={styles.transportFrame}>
				<span className={styles.frameNow}>{frame}</span>
				<span className={styles.frameSep}>/</span>
				<span className={styles.frameMax}>{totalFrames}</span>
			</span>
		</div>
	);
};

const ImportIcon = () => (
	<svg
		aria-hidden="true"
		fill="none"
		height="12"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="1.8"
		viewBox="0 0 16 16"
		width="12"
	>
		<path d="M8 2 V10" />
		<path d="M4.5 6.5 L8 10 L11.5 6.5" />
		<path d="M2.5 12 V13 A1 1 0 0 0 3.5 14 H12.5 A1 1 0 0 0 13.5 13 V12" />
	</svg>
);

const CopyIcon = () => (
	<svg
		aria-hidden="true"
		fill="none"
		height="12"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="1.6"
		viewBox="0 0 16 16"
		width="12"
	>
		<rect height="9" rx="1.6" width="9" x="5" y="5" />
		<path d="M3 11 H2.6 A1 1 0 0 1 1.6 10 V3 A1 1 0 0 1 2.6 2 H10 A1 1 0 0 1 11 3 V3.4" />
	</svg>
);

const ResetIcon = () => (
	<svg
		aria-hidden="true"
		fill="none"
		height="12"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="1.6"
		viewBox="0 0 16 16"
		width="12"
	>
		<path d="M3 8 A5 5 0 1 0 5 4" />
		<path d="M2 1.5 L3 4.5 L6 3.5" />
	</svg>
);

const LoopIcon = () => (
	<svg
		aria-hidden="true"
		fill="none"
		height="14"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="1.6"
		viewBox="0 0 16 16"
		width="14"
	>
		<path d="M3 6 A4 4 0 0 1 11 6 L11 9" />
		<path d="M13 7.5 L11 9.5 L9 7.5" />
		<path d="M13 10 A4 4 0 0 1 5 10 L5 7" />
		<path d="M3 8.5 L5 6.5 L7 8.5" />
	</svg>
);

const AutoplayIcon = () => (
	<svg
		aria-hidden="true"
		fill="none"
		height="14"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="1.6"
		viewBox="0 0 16 16"
		width="14"
	>
		<circle cx="8" cy="8" r="6" />
		<path d="M6.5 5.5 L11 8 L6.5 10.5 Z" fill="currentColor" />
	</svg>
);

const MediaControls = ({
	speed,
	setSpeed,
	loop,
	setLoop,
	autoplay,
	setAutoplay,
}: {
	speed: number;
	setSpeed: (n: number) => void;
	loop: boolean;
	setLoop: (v: boolean) => void;
	autoplay: boolean;
	setAutoplay: (v: boolean) => void;
}) => (
	<div className={styles.mediaControls}>
		<div className={styles.speedPicker}>
			{SPEED_TICKS.map((s) => (
				<button
					className={cn(
						styles.speedPill,
						Math.abs(speed - s) < 0.001 && styles.speedPillActive,
					)}
					key={s}
					onClick={() => setSpeed(s)}
					type="button"
				>
					{s}x
				</button>
			))}
		</div>
		<div className={styles.toggles}>
			<button
				aria-label="Loop"
				aria-pressed={loop}
				className={cn(styles.toggle, loop && styles.toggleActive)}
				onClick={() => setLoop(!loop)}
				title="Loop"
				type="button"
			>
				<LoopIcon />
			</button>
			<button
				aria-label="Autoplay"
				aria-pressed={autoplay}
				className={cn(styles.toggle, autoplay && styles.toggleActive)}
				onClick={() => setAutoplay(!autoplay)}
				title="Autoplay"
				type="button"
			>
				<AutoplayIcon />
			</button>
		</div>
	</div>
);
