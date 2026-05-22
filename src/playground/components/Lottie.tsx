import { type DotLottie, DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { cn } from "../../utils/cn";
import { lottieUrl } from "../../utils/assets";
import { useUrlState } from "../../utils/useUrlState";
import { useLottieIndex } from "../useLottieIndex";
import styles from "./Lottie.module.css";
import { Card, Preview, Scrubber, SearchBar, SectionHead } from "./shared";
import shared from "./shared.module.css";

const CELL_MIN_WIDTH = 110;
const CELL_HEIGHT = 110;
const ROW_GAP = 8;
const ROW_TOTAL = CELL_HEIGHT + ROW_GAP;

const DEFAULT_LOTTIE = "SpacemanHappy";
const DEFAULT_SRC = lottieUrl(DEFAULT_LOTTIE);

const paramToSrc = (param: string): string =>
	param.includes("://") ? param : lottieUrl(param);

const srcToParam = (src: string): string => {
	const match = src.match(/\/anim\/lottie\/([^/]+)\.lottie$/);
	return match ? match[1] : src;
};

const SIZE_MIN = 64;
const SIZE_MAX = 480;
const SIZE_TICKS = [64, 120, 180, 240, 320, 400, 480];
const SPEED_TICKS = [0.25, 0.5, 1, 1.5, 2, 3];

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

export const LottieWorkbench = () => {
	const [lottieParam, setLottieParam] = useUrlState("lottie", DEFAULT_LOTTIE);
	const src = paramToSrc(lottieParam);
	const setSrc = (next: string) => setLottieParam(srcToParam(next));
	const [size, setSize] = useState(240);
	const [speed, setSpeed] = useState(1);
	const [loop, setLoop] = useState(true);
	const [autoplay, setAutoplay] = useState(true);

	const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
	const [frame, setFrame] = useState(0);
	const [totalFrames, setTotalFrames] = useState(0);
	const [duration, setDuration] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [previewReady, setPreviewReady] = useState(false);

	useEffect(() => {
		const t = setTimeout(() => setPreviewReady(true), 1500);
		return () => clearTimeout(t);
	}, []);

	useEffect(() => {
		if (!previewReady || !dotLottie || !autoplay) return;
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
		[dotLottie]
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
		const match = src.match(/\/anim\/lottie\/([^/]+)\.lottie$/);
		if (match) return toLabel(match[1]);
		const last = src.split("/").pop() ?? "";
		return last.replace(/\.(lottie|json)$/i, "") || "Custom";
	}, [src]);

	const previewMeta = [
		lottieName,
		`${size}px`,
		duration ? `${duration.toFixed(2)}s` : null,
		totalFrames ? `${totalFrames}f` : null,
		`${speed.toFixed(2)}x`,
	];

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
					copyLabel="Src"
					meta={previewMeta}
					onCopy={() => navigator.clipboard.writeText(src)}
					title="Preview"
				>
					<div
						className={styles.playerInner}
						style={{ height: `${size}px`, width: `${size}px` }}
					>
						{error ? (
							<div className={styles.errBox}>
								<span className={styles.errLabel}>
									LOAD ERROR
								</span>
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
						onChange={(e) => setSrc(e.target.value)}
						placeholder="https://lottie.host/…"
						spellCheck={false}
						type="text"
						value={src}
					/>
					<button
						aria-label="Reset to default"
						className={styles.urlClear}
						onClick={() => setSrc(DEFAULT_SRC)}
						title="Reset"
						type="button"
					>
						<ResetIcon />
					</button>
				</div>
			</aside>

			<section className={shared.canvas}>
				<div className={shared.section}>
					<SectionHead title="Library">
						Pick a lottie from the Gliff library, or paste any
						remote URL into <em>src</em>.
					</SectionHead>
					<LottieList onPick={setSrc} src={src} />
				</div>
			</section>
		</div>
	);
};

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

const LottieList = ({
	src,
	onPick,
}: {
	src: string;
	onPick: (url: string) => void;
}) => {
	const files = useLottieIndex();
	const [query, setQuery] = useState("");
	const scrollRef = useRef<HTMLDivElement>(null);
	const [cols, setCols] = useState(4);

	const visible = useMemo(() => {
		if (!files) return [];
		const q = query.toLowerCase().trim();
		if (!q) return files;
		return files.filter((name) => name.toLowerCase().includes(q));
	}, [files, query]);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		const ro = new ResizeObserver(([entry]) => {
			const w = entry.contentRect.width;
			setCols(
				Math.max(
					1,
					Math.floor((w + ROW_GAP) / (CELL_MIN_WIDTH + ROW_GAP)),
				),
			);
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const rowCount = Math.ceil(visible.length / cols);
	const virtualizer = useVirtualizer({
		count: rowCount,
		getScrollElement: () => scrollRef.current,
		estimateSize: () => ROW_TOTAL,
		overscan: 3,
	});

	return (
		<>
			<SearchBar
				matched={visible.length}
				onChange={setQuery}
				placeholder="Filter lotties by name…"
				total={files?.length ?? 0}
				value={query}
			/>
			<div className={styles.lottieScroll} ref={scrollRef}>
				{files === null ? (
					<div className={shared.gridEmpty}>Loading library…</div>
				) : visible.length === 0 ? (
					<div className={shared.gridEmpty}>
						No matches for <em>"{query}"</em>
					</div>
				) : (
					<div
						style={{
							height: virtualizer.getTotalSize(),
							position: "relative",
						}}
					>
						{virtualizer.getVirtualItems().map((row) => {
							const start = row.index * cols;
							const rowNames = visible.slice(start, start + cols);
							return (
								<div
									className={shared.gridRow}
									key={row.key}
									style={{
										transform: `translateY(${row.start}px)`,
										gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
										height: row.size,
									}}
								>
									{rowNames.map((name) => (
										<LottieCard
											active={src === lottieUrl(name)}
											key={name}
											name={name}
											onClick={() => onPick(lottieUrl(name))}
										/>
									))}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</>
	);
};

const LottieCard = ({
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

	const handleRef = useCallback(
		(dl: DotLottie | null) => {
			dlRef.current = dl;
			if (!dl) return;
			dl.addEventListener("load", () => {
				// Briefly play, then pause + seek to mid; this forces the
				// renderer to draw the mid frame instead of leaving it blank.
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
};
