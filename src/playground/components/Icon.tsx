import {
	type CSSProperties,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { Icon, type TIconProps } from "../../components/Icon/Icon";
import styles from "./Icon.module.css";

/* ────────────────────────────────────────────────────────────────────
 * Family-style catalog. Mirrors fa.css. Tabular order for the matrix.
 * ──────────────────────────────────────────────────────────────────── */

type TSet = NonNullable<TIconProps["set"]>;
type TType = NonNullable<TIconProps["type"]>;
type Variant = {
	set: TSet;
	type?: TType;
	family: string;
	style: string;
	weight: 100 | 300 | 400 | 600 | 900;
};

const VARIANTS: Variant[] = [
	// Row 1 — Classic & Duotone (8)
	{ set: "classic", type: "thin", family: "Classic", style: "Thin", weight: 100 },
	{ set: "classic", type: "light", family: "Classic", style: "Light", weight: 300 },
	{ set: "classic", type: "regular", family: "Classic", style: "Regular", weight: 400 },
	{ set: "classic", type: "solid", family: "Classic", style: "Solid", weight: 900 },
	{ set: "duotone", type: "thin", family: "Duotone", style: "Thin", weight: 100 },
	{ set: "duotone", type: "light", family: "Duotone", style: "Light", weight: 300 },
	{ set: "duotone", type: "regular", family: "Duotone", style: "Regular", weight: 400 },
	{ set: "duotone", type: "solid", family: "Duotone", style: "Solid", weight: 900 },
	// Row 2 — Sharp & Sharp Duotone (8)
	{ set: "sharp", type: "thin", family: "Sharp", style: "Thin", weight: 100 },
	{ set: "sharp", type: "light", family: "Sharp", style: "Light", weight: 300 },
	{ set: "sharp", type: "regular", family: "Sharp", style: "Regular", weight: 400 },
	{ set: "sharp", type: "solid", family: "Sharp", style: "Solid", weight: 900 },
	{ set: "sharp-duotone", type: "thin", family: "Sharp Duotone", style: "Thin", weight: 100 },
	{ set: "sharp-duotone", type: "light", family: "Sharp Duotone", style: "Light", weight: 300 },
	{ set: "sharp-duotone", type: "regular", family: "Sharp Duotone", style: "Regular", weight: 400 },
	{ set: "sharp-duotone", type: "solid", family: "Sharp Duotone", style: "Solid", weight: 900 },
	// Row 3 — Style families (8)
	{ set: "brand", family: "Brand", style: "", weight: 400 },
	{ set: "chisel", type: "regular", family: "Chisel", style: "Regular", weight: 400 },
	{ set: "etch", type: "solid", family: "Etch", style: "Solid", weight: 900 },
	{ set: "graphite", type: "thin", family: "Graphite", style: "Thin", weight: 100 },
	{ set: "thumbprint", type: "light", family: "Thumbprint", style: "Light", weight: 300 },
	{ set: "whiteboard", type: "semibold", family: "Whiteboard", style: "Semibold", weight: 600 },
	{ set: "jelly", type: "regular", family: "Jelly", style: "Regular", weight: 400 },
	{ set: "jelly-duo", type: "regular", family: "Jelly Duo", style: "Regular", weight: 400 },
	// Row 4 — More style families (8)
	{ set: "jelly-fill", type: "regular", family: "Jelly Fill", style: "Regular", weight: 400 },
	{ set: "notdog", type: "solid", family: "Notdog", style: "Solid", weight: 900 },
	{ set: "notdog-duo", type: "solid", family: "Notdog Duo", style: "Solid", weight: 900 },
	{ set: "slab", type: "regular", family: "Slab", style: "Regular", weight: 400 },
	{ set: "slab-press", type: "regular", family: "Slab Press", style: "Regular", weight: 400 },
	{ set: "utility", type: "semibold", family: "Utility", style: "Semibold", weight: 600 },
	{ set: "utility-duo", type: "semibold", family: "Utility Duo", style: "Semibold", weight: 600 },
	{ set: "utility-fill", type: "semibold", family: "Utility Fill", style: "Semibold", weight: 600 },
];

/* ────────────────────────────────────────────────────────────────────
 * Curated popular glyphs (codes from FA v7 Pro).
 * ──────────────────────────────────────────────────────────────────── */

const POPULAR_GLYPHS: { code: string; name: string }[] = [
	{ code: "f007", name: "user" },
	{ code: "f015", name: "home" },
	{ code: "f013", name: "gear" },
	{ code: "f002", name: "search" },
	{ code: "f067", name: "plus" },
	{ code: "f068", name: "minus" },
	{ code: "f00c", name: "check" },
	{ code: "f00d", name: "xmark" },
	{ code: "f0e0", name: "envelope" },
	{ code: "f095", name: "phone" },
	{ code: "f053", name: "chevron-left" },
	{ code: "f054", name: "chevron-right" },
	{ code: "f077", name: "chevron-up" },
	{ code: "f078", name: "chevron-down" },
	{ code: "f0c9", name: "bars" },
	{ code: "f0c5", name: "copy" },
	{ code: "f1f8", name: "trash-can" },
	{ code: "f044", name: "pen" },
	{ code: "f0c7", name: "floppy-disk" },
	{ code: "f019", name: "download" },
	{ code: "f093", name: "upload" },
	{ code: "f04b", name: "play" },
	{ code: "f04c", name: "pause" },
	{ code: "f04d", name: "stop" },
	{ code: "f028", name: "volume-high" },
	{ code: "f005", name: "star" },
	{ code: "f004", name: "heart" },
	{ code: "f165", name: "thumbs-up" },
	{ code: "f164", name: "thumbs-down" },
	{ code: "f02e", name: "bookmark" },
	{ code: "f071", name: "triangle-exclam" },
	{ code: "f06a", name: "circle-exclam" },
	{ code: "f05a", name: "circle-info" },
	{ code: "f058", name: "circle-check" },
	{ code: "f06e", name: "eye" },
	{ code: "f070", name: "eye-slash" },
	{ code: "f02d", name: "book" },
	{ code: "f15c", name: "file-lines" },
	{ code: "f07b", name: "folder" },
	{ code: "f07c", name: "folder-open" },
	{ code: "f1e5", name: "newspaper" },
	{ code: "f0a1", name: "bullhorn" },
	{ code: "f185", name: "sun" },
	{ code: "f186", name: "moon" },
	{ code: "f0eb", name: "lightbulb" },
	{ code: "f155", name: "dollar" },
	{ code: "e1bc", name: "indian-rupee" },
	{ code: "f17b", name: "android" },
	{ code: "f179", name: "apple" },
	{ code: "f3ed", name: "shield" },
	{ code: "f021", name: "rotate" },
	{ code: "f0ad", name: "wrench" },
	{ code: "f005", name: "star" },
	{ code: "f1da", name: "clock-rotate" },
	{ code: "f0d0", name: "wand-magic" },
	{ code: "f3c5", name: "map-marker" },
	{ code: "f24e", name: "scale-balanced" },
	{ code: "f4ff", name: "tags" },
	{ code: "f02f", name: "print" },
	{ code: "f0c0", name: "users" },
	{ code: "f06c", name: "leaf" },
	{ code: "f0e7", name: "bolt" },
	{ code: "f0a3", name: "certificate" },
];

/* ────────────────────────────────────────────────────────────────────
 * Workbench
 * ──────────────────────────────────────────────────────────────────── */

export const IconWorkbench = () => {
	const [code, setCode] = useState("f007");
	const [activeIdx, setActiveIdx] = useState(2); // classic / regular
	const [size, setSize] = useState(96);
	const [query, setQuery] = useState("");

	const active = VARIANTS[activeIdx];

	const filtered = useMemo(() => {
		if (!query.trim()) return POPULAR_GLYPHS;
		const q = query.toLowerCase().trim();
		return POPULAR_GLYPHS.filter(
			(g) => g.code.includes(q) || g.name.includes(q)
		);
	}, [query]);

	const iconProps = useMemo(
		() =>
			({
				code,
				set: active.set,
				type: active.type,
				style: { ["--iconSize" as string]: `${size}px` },
			}) as TIconProps,
		[code, active, size]
	);

	return (
		<div className={styles.workbench}>
			<aside className={styles.sidebar}>
				<Specimen
					code={code}
					family={active.family}
					iconProps={iconProps}
					size={size}
					style={active.style}
					weight={active.weight}
				/>
				<SizeScrubber size={size} onChange={setSize} />
				<Snippet code={code} set={active.set} type={active.type} size={size} />
			</aside>

			<section className={styles.canvas}>
				<VariantMatrix
					code={code}
					activeIdx={activeIdx}
					onPick={setActiveIdx}
				/>
				<GlyphCatalog
					glyphs={filtered}
					total={POPULAR_GLYPHS.length}
					query={query}
					onQuery={setQuery}
					activeCode={code}
					activeVariant={active}
					onPick={setCode}
				/>
			</section>
		</div>
	);
};

/* ────────────────────────────────────────────────────────────────────
 * Specimen — selected glyph details and preview
 * ──────────────────────────────────────────────────────────────────── */

const Specimen = ({
	code,
	family,
	iconProps,
	size,
	style,
	weight,
}: {
	code: string;
	family: string;
	iconProps: TIconProps;
	size: number;
	style: string;
	weight: number | string;
}) => {
	const [bumpKey, setBumpKey] = useState(0);

	useEffect(() => {
		setBumpKey((k) => k + 1);
	}, [iconProps.code, iconProps.set, iconProps.type]);

	const metaParts = [family, style, String(weight), `${size}px`].filter(Boolean);

	return (
		<div className={styles.specimen}>
			<div className={styles.specimenInfo}>
				<div className={styles.specimenHead}>
					<div className={styles.specimenCode} key={code}>
						{code}
					</div>
					<CopyButton onCopy={() => navigator.clipboard.writeText(code)} />
				</div>
				<div className={styles.specimenMeta}>
					{metaParts.map((part, i) => (
						<span className={styles.metaItem} key={`${part}-${i}`}>
							{part}
						</span>
					))}
				</div>
			</div>
			<div className={styles.specimenPreview}>
				<div aria-hidden="true" className={styles.specimenGrid} />
				<div className={styles.specimenGlyph} key={`g-${bumpKey}`}>
					<Icon {...iconProps} />
				</div>
			</div>
		</div>
	);
};

const CopyButton = ({
	onCopy,
	className,
}: {
	onCopy: () => void | Promise<void>;
	className?: string;
}) => {
	const [copied, setCopied] = useState(false);
	const handleClick = useCallback(async () => {
		try {
			await onCopy();
			setCopied(true);
			setTimeout(() => setCopied(false), 1400);
		} catch {}
	}, [onCopy]);

	return (
		<button
			aria-label="Copy"
			className={`${styles.copyBtn}${className ? ` ${className}` : ""}`}
			data-state={copied ? "copied" : "idle"}
			onClick={handleClick}
			type="button"
		>
			<svg
				aria-hidden="true"
				className={styles.copyIcon}
				fill="none"
				height="12"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.6"
				viewBox="0 0 16 16"
				width="12"
			>
				{copied ? (
					<path d="M3.5 8.5 L6.5 11.5 L12.5 5" />
				) : (
					<>
						<rect height="9" rx="1.6" width="9" x="5" y="5" />
						<path d="M3 11 H2.6 A1 1 0 0 1 1.6 10 V3 A1 1 0 0 1 2.6 2 H10 A1 1 0 0 1 11 3 V3.4" />
					</>
				)}
			</svg>
			<span className={styles.copyLabel}>COPIED</span>
		</button>
	);
};

/* ────────────────────────────────────────────────────────────────────
 * Size scrubber — custom range with tick marks
 * ──────────────────────────────────────────────────────────────────── */

const SCRUB_MIN = 4;
const SCRUB_MAX = 256;
const SCRUB_TICKS = [4, 32, 64, 96, 128, 160, 192, 224, 256];

const SizeScrubber = ({
	size,
	onChange,
}: {
	size: number;
	onChange: (n: number) => void;
}) => {
	const pct = ((size - SCRUB_MIN) / (SCRUB_MAX - SCRUB_MIN)) * 100;
	return (
		<div className={styles.scrubber}>
			<div className={styles.scrubberValue} key={size}>
				<NumberFlip value={size} />
				<span className={styles.scrubberUnit}>px</span>
			</div>
			<div className={styles.scrubberTrack}>
				<div
					className={styles.scrubberFill}
					style={{ width: `${pct}%` }}
					aria-hidden="true"
				/>
				<div
					className={styles.scrubberThumb}
					style={{ left: `${pct}%` }}
					aria-hidden="true"
				/>
				<input
					type="range"
					min={SCRUB_MIN}
					max={SCRUB_MAX}
					step={1}
					value={size}
					onChange={(e) => onChange(Number(e.target.value))}
					className={styles.scrubberInput}
					aria-label="Icon size"
				/>
			</div>
			<div className={styles.scrubberTicks} aria-hidden="true">
				{SCRUB_TICKS.map((t) => (
					<button
						key={t}
						type="button"
						className={`${styles.tick} ${size === t ? styles.tickActive : ""}`}
						onClick={() => onChange(t)}
						style={
							{
								"--tick-pos": `${((t - SCRUB_MIN) / (SCRUB_MAX - SCRUB_MIN)) * 100}%`,
							} as CSSProperties
						}
					>
						{t}
					</button>
				))}
			</div>
		</div>
	);
};

/* ────────────────────────────────────────────────────────────────────
 * Tabular number that flips digit-by-digit on change.
 * ──────────────────────────────────────────────────────────────────── */

const NumberFlip = ({ value }: { value: number | string }) => {
	const str = String(value);
	return (
		<span className={styles.flipNum}>
			{str.split("").map((ch, i) => (
				<span key={`${i}-${ch}`} className={styles.flipDigit}>
					{ch}
				</span>
			))}
		</span>
	);
};

/* ────────────────────────────────────────────────────────────────────
 * Snippet — copy-on-click JSX block
 * ──────────────────────────────────────────────────────────────────── */

const Snippet = ({
	code,
	set,
	type,
	size,
}: {
	code: string;
	set: TSet;
	type?: TType;
	size: number;
}) => {
	const text =
		set === "classic" && (!type || type === "regular")
			? `<Icon\n  code="${code}"\n  className="ico-${Math.round(size / 4)}"\n/>`
			: set === "brand"
				? `<Icon\n  code="${code}"\n  set="brand"\n  className="ico-${Math.round(size / 4)}"\n/>`
				: type
					? `<Icon\n  code="${code}"\n  set="${set}"\n  type="${type}"\n  className="ico-${Math.round(size / 4)}"\n/>`
					: `<Icon\n  code="${code}"\n  set="${set}"\n  className="ico-${Math.round(size / 4)}"\n/>`;
	const lines = text.split("\n");

	return (
		<div className={styles.snippet}>
			<CopyButton
				className={styles.snippetCopy}
				onCopy={() => navigator.clipboard.writeText(text)}
			/>
			<pre className={styles.snippetBody}>
				<code>
					{lines.map((line, i) => (
						<div className={styles.snippetLine} key={i}>
							<span className={styles.snippetLineNo}>{i + 1}</span>
							<span className={styles.snippetLineCode}>
								{colorize(line)}
							</span>
						</div>
					))}
				</code>
			</pre>
		</div>
	);
};

const colorize = (src: string): ReactNode[] => {
	const out: ReactNode[] = [];
	const re = /(<\/?[A-Za-z]+)|(\/?>)|(\b[a-z][\w-]*=)|("[^"]*")|(\{|\})/g;
	let m: RegExpExecArray | null;
	let last = 0;
	while ((m = re.exec(src)) !== null) {
		if (m.index > last) {
			out.push(src.slice(last, m.index));
		}
		const t = m[0];
		const cls = m[1]
			? styles.synTag
			: m[2]
				? styles.synBracket
				: m[3]
					? styles.synAttr
					: m[4]
						? styles.synStr
						: styles.synBrace;
		out.push(
			<span key={m.index} className={cls}>
				{t}
			</span>
		);
		last = re.lastIndex;
	}
	if (last < src.length) out.push(src.slice(last));
	return out;
};

/* ────────────────────────────────────────────────────────────────────
 * Variant matrix — current glyph across all 32 family-styles
 * ──────────────────────────────────────────────────────────────────── */

const VariantMatrix = ({
	code,
	activeIdx,
	onPick,
}: {
	code: string;
	activeIdx: number;
	onPick: (idx: number) => void;
}) => {
	return (
		<div className={styles.section}>
			<header className={styles.sectionHead}>
				<h2 className={styles.sectionTitle}>Variants</h2>
				<p className={styles.sectionDesc}>
					Selected glyph rendered across{" "}
					<NumberFlip value={VARIANTS.length} /> available styles.
				</p>
			</header>
			<div className={styles.matrix}>
				{VARIANTS.map((v, idx) => (
					<button
						type="button"
						key={`${v.set}-${v.type ?? "x"}`}
						className={`${styles.cell} ${idx === activeIdx ? styles.cellActive : ""}`}
						onClick={() => onPick(idx)}
						style={
							{
								animationDelay: `${idx * 14}ms`,
							} as CSSProperties
						}
					>
						<div className={styles.cellGlyph}>
							<Icon
								{...({
									code,
									set: v.set,
									type: v.type,
									style: { ["--iconSize" as string]: "28px" },
								} as TIconProps)}
							/>
						</div>
						<div className={styles.cellMeta}>
							<span className={styles.cellFamily}>{v.family}</span>
							<span className={styles.cellStyle}>{v.style}</span>
						</div>
					</button>
				))}
			</div>
		</div>
	);
};

/* ────────────────────────────────────────────────────────────────────
 * Glyph catalog — dense, searchable popular icons
 * ──────────────────────────────────────────────────────────────────── */

const GlyphCatalog = ({
	glyphs,
	total,
	query,
	onQuery,
	activeCode,
	activeVariant,
	onPick,
}: {
	glyphs: { code: string; name: string }[];
	total: number;
	query: string;
	onQuery: (q: string) => void;
	activeCode: string;
	activeVariant: Variant;
	onPick: (c: string) => void;
}) => {
	return (
		<div className={styles.section}>
			<header className={styles.sectionHead}>
				<h2 className={styles.sectionTitle}>Glyphs</h2>
				<p className={styles.sectionDesc}>
					<NumberFlip value={total} /> common glyphs in{" "}
					<em>
						{activeVariant.family} {activeVariant.style}
					</em>
					.
				</p>
			</header>
			<div className={styles.catalogSearch}>
				<svg
					width="14"
					height="14"
					viewBox="0 0 16 16"
					aria-hidden="true"
					className={styles.searchIcon}
				>
					<circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" />
					<line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" />
				</svg>
				<input
					type="text"
					value={query}
					onChange={(e) => onQuery(e.target.value)}
					placeholder="Filter by name or unicode hex…"
					className={styles.catalogInput}
				/>
				<span className={styles.catalogCount}>
					<NumberFlip value={glyphs.length} />/<NumberFlip value={total} />
				</span>
			</div>
			<div className={styles.catalog}>
				{glyphs.length === 0 ? (
					<div className={styles.catalogEmpty}>
						No matches for <em>"{query}"</em>
					</div>
				) : (
					glyphs.map((g, idx) => (
						<button
							type="button"
							key={`${g.code}-${idx}`}
							className={`${styles.glyphCell} ${activeCode === g.code ? styles.glyphCellActive : ""}`}
							onClick={() => onPick(g.code)}
							style={
								{
									animationDelay: `${Math.min(idx * 8, 400)}ms`,
								} as CSSProperties
							}
							title={`${g.name} · ${g.code}`}
						>
							<div className={styles.glyphCellIcon}>
								<Icon
									{...({
										code: g.code,
										set: activeVariant.set,
										type: activeVariant.type,
										style: { ["--iconSize" as string]: "22px" },
									} as TIconProps)}
								/>
							</div>
							<span className={styles.glyphCellCode}>{g.code}</span>
							<span className={styles.glyphCellName}>{g.name}</span>
						</button>
					))
				)}
			</div>
		</div>
	);
};
