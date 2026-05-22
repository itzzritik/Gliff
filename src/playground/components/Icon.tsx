import { type CSSProperties, type ReactNode, useMemo, useState } from "react";
import { Icon, type TIconProps } from "../../components/Icon/Icon";
import { cn } from "../../utils/cn";
import { type IconData, useIconData } from "../useIconData";
import styles from "./Icon.module.css";
import { CopyButton, iconSize, NumberFlip, SectionHead } from "./shared";
import shared from "./shared.module.css";

type TSet = NonNullable<TIconProps["set"]>;
type TType = NonNullable<TIconProps["type"]>;

interface Glyph {
	code: string;
	name: string;
}

interface Variant {
	set: TSet;
	type?: TType;
	family: string;
	style: string;
	weight: 100 | 300 | 400 | 600 | 900;
}

const WEIGHT_BY_TYPE: Record<TType, Variant["weight"]> = {
	thin: 100,
	light: 300,
	regular: 400,
	semibold: 600,
	solid: 900,
};

const titleCase = (s: string) =>
	s
		.split("-")
		.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
		.join(" ");

const variant = (set: TSet, type?: TType): Variant => ({
	set,
	type,
	family: titleCase(set),
	style: type ? titleCase(type) : "",
	weight: type ? WEIGHT_BY_TYPE[type] : 400,
});

const FOUR_TYPES: TType[] = ["thin", "light", "regular", "solid"];

const VARIANTS: Variant[] = [
	...(["classic", "duotone", "sharp", "sharp-duotone"] as const).flatMap(
		(s) => FOUR_TYPES.map((t) => variant(s, t))
	),
	variant("brand"),
	variant("chisel", "regular"),
	variant("etch", "solid"),
	variant("graphite", "thin"),
	variant("thumbprint", "light"),
	variant("whiteboard", "semibold"),
	variant("jelly", "regular"),
	variant("jelly-duo", "regular"),
	variant("jelly-fill", "regular"),
	variant("notdog", "solid"),
	variant("notdog-duo", "solid"),
	variant("slab", "regular"),
	variant("slab-press", "regular"),
	variant("utility", "semibold"),
	variant("utility-duo", "semibold"),
	variant("utility-fill", "semibold"),
];

const DEFAULT_VARIANT_IDX = VARIANTS.findIndex(
	(v) => v.set === "classic" && v.type === "regular"
);

// Bridges Icon.tsx's {set, type} shape to icons.json's sprite-slug strings.
const variantToSlug = (v: Variant): string => {
	if (v.set === "classic") return v.type as string;
	if (v.set === "brand") return "brands";
	if (v.set === "duotone" && v.type === "solid") return "duotone";
	return v.type ? `${v.set}-${v.type}` : v.set;
};

const VARIANT_IDX_BY_SLUG = new Map(
	VARIANTS.map((v, i) => [variantToSlug(v), i] as const)
);

const supportedVariantIndices = (
	data: IconData | null,
	code: string
): Set<number> | null => {
	if (!data) return null;
	const glyph = data.glyphs[code];
	if (!glyph) return new Set();
	const set = new Set<number>();
	for (const dataIdx of glyph.v) {
		const local = VARIANT_IDX_BY_SLUG.get(data.variants[dataIdx]);
		if (local !== undefined) set.add(local);
	}
	return set;
};

const variantForGlyph = (
	data: IconData | null,
	code: string,
	active: Variant
): Variant => {
	if (!data) return active;
	const supported = supportedVariantIndices(data, code);
	if (!supported || supported.size === 0) return active;
	const activeIdx = VARIANT_IDX_BY_SLUG.get(variantToSlug(active));
	if (activeIdx !== undefined && supported.has(activeIdx)) return active;
	const first = [...supported][0];
	return VARIANTS[first];
};

const POPULAR_GLYPHS: Glyph[] = [
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

const SCRUB_MIN = 4;
const SCRUB_MAX = 256;
const SCRUB_TICKS = [4, 32, 64, 96, 128, 160, 192, 224, 256];
const tickPct = (t: number) =>
	((t - SCRUB_MIN) / (SCRUB_MAX - SCRUB_MIN)) * 100;

const SYNTAX_RE = /(<\/?[A-Za-z]+)|(\/?>)|(\b[a-z][\w-]*=)|("[^"]*")|(\{|\})/g;

const renderIcon = (
	code: string,
	set: TSet,
	type: TType | undefined,
	px: number
) => <Icon {...({ code, set, style: iconSize(px), type } as TIconProps)} />;

export const IconWorkbench = () => {
	const [code, setCode] = useState("f007");
	const [activeIdx, setActiveIdx] = useState(DEFAULT_VARIANT_IDX);
	const [size, setSize] = useState(96);
	const [query, setQuery] = useState("");

	const iconData = useIconData();
	const active = VARIANTS[activeIdx];

	const supported = useMemo(
		() => supportedVariantIndices(iconData, code),
		[iconData, code]
	);

	const filtered = useMemo(() => {
		const q = query.toLowerCase().trim();
		if (!q) return POPULAR_GLYPHS;
		return POPULAR_GLYPHS.filter(
			(g) => g.code.includes(q) || g.name.includes(q)
		);
	}, [query]);

	return (
		<div className={shared.workbench}>
			<aside className={shared.sidebar}>
				<Specimen code={code} size={size} variant={active} />
				<SizeScrubber onChange={setSize} size={size} />
				<Snippet
					code={code}
					set={active.set}
					size={size}
					type={active.type}
				/>
			</aside>

			<section className={shared.canvas}>
				<VariantMatrix
					activeIdx={activeIdx}
					code={code}
					onPick={setActiveIdx}
					supported={supported}
				/>
				<GlyphCatalog
					activeCode={code}
					activeVariant={active}
					glyphs={filtered}
					iconData={iconData}
					onPick={setCode}
					onQuery={setQuery}
					query={query}
					total={POPULAR_GLYPHS.length}
				/>
			</section>
		</div>
	);
};

const Specimen = ({
	code,
	size,
	variant: v,
}: {
	code: string;
	size: number;
	variant: Variant;
}) => {
	const glyphKey = `${code}-${v.set}-${v.type ?? ""}`;
	const meta: { label: string; value: string }[] = [
		{ label: "family", value: v.family },
		{ label: "style", value: v.style },
		{ label: "weight", value: String(v.weight) },
		{ label: "size", value: `${size}px` },
	].filter((m) => m.value);

	return (
		<div className={styles.specimen}>
			<div className={styles.specimenInfo}>
				<div className={styles.specimenHead}>
					<div className={styles.specimenCode} key={code}>
						{code}
					</div>
					<CopyButton
						onCopy={() => navigator.clipboard.writeText(code)}
					/>
				</div>
				<div className={styles.specimenMeta}>
					{meta.map((m) => (
						<span className={styles.metaItem} key={m.label}>
							{m.value}
						</span>
					))}
				</div>
			</div>
			<div className={styles.specimenPreview}>
				<div aria-hidden="true" className={styles.specimenGrid} />
				<div className={styles.specimenGlyph} key={glyphKey}>
					{renderIcon(code, v.set, v.type, size)}
				</div>
			</div>
		</div>
	);
};

const SizeScrubber = ({
	onChange,
	size,
}: {
	onChange: (n: number) => void;
	size: number;
}) => {
	const pct = tickPct(size);
	return (
		<div className={styles.scrubber}>
			<div className={styles.scrubberValue} key={size}>
				<NumberFlip value={size} />
				<span className={styles.scrubberUnit}>px</span>
			</div>
			<div className={styles.scrubberTrack}>
				<div
					aria-hidden="true"
					className={styles.scrubberFill}
					style={{ width: `${pct}%` }}
				/>
				<div
					aria-hidden="true"
					className={styles.scrubberThumb}
					style={{ left: `${pct}%` }}
				/>
				<input
					aria-label="Icon size"
					className={styles.scrubberInput}
					max={SCRUB_MAX}
					min={SCRUB_MIN}
					onChange={(e) => onChange(Number(e.target.value))}
					step={1}
					type="range"
					value={size}
				/>
			</div>
			<div aria-hidden="true" className={styles.scrubberTicks}>
				{SCRUB_TICKS.map((t) => (
					<button
						className={cn(
							styles.tick,
							size === t && styles.tickActive
						)}
						key={t}
						onClick={() => onChange(t)}
						style={
							{ "--tick-pos": `${tickPct(t)}%` } as CSSProperties
						}
						type="button"
					>
						{t}
					</button>
				))}
			</div>
		</div>
	);
};

const buildSnippet = (
	code: string,
	set: TSet,
	type: TType | undefined,
	size: number
): string => {
	const sizeClass = `ico-${Math.round(size / 4)}`;
	const attrs = [`code="${code}"`];
	if (set !== "classic") attrs.push(`set="${set}"`);
	if (type && type !== "regular" && set !== "brand")
		attrs.push(`type="${type}"`);
	attrs.push(`className="${sizeClass}"`);
	return `<Icon\n  ${attrs.join("\n  ")}\n/>`;
};

const Snippet = ({
	code,
	set,
	size,
	type,
}: {
	code: string;
	set: TSet;
	size: number;
	type?: TType;
}) => {
	const text = buildSnippet(code, set, type, size);
	const lines = text.split("\n");

	return (
		<div className={styles.snippet}>
			<CopyButton
				appearance="dark"
				className={styles.snippetCopy}
				onCopy={() => navigator.clipboard.writeText(text)}
			/>
			<pre className={styles.snippetBody}>
				<code>
					{lines.map((line, i) => (
						<div
							className={styles.snippetLine}
							key={`${i}:${line}`}
						>
							<span className={styles.snippetLineNo}>
								{i + 1}
							</span>
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

const SYN_CLASSES = [
	styles.synTag,
	styles.synBracket,
	styles.synAttr,
	styles.synStr,
	styles.synBrace,
];

const colorize = (src: string): ReactNode[] => {
	const out: ReactNode[] = [];
	let last = 0;
	for (const m of src.matchAll(SYNTAX_RE)) {
		const idx = m.index ?? 0;
		if (idx > last) out.push(src.slice(last, idx));
		const groupIdx = [1, 2, 3, 4, 5].findIndex((i) => m[i] !== undefined);
		out.push(
			<span className={SYN_CLASSES[groupIdx]} key={idx}>
				{m[0]}
			</span>
		);
		last = idx + m[0].length;
	}
	if (last < src.length) out.push(src.slice(last));
	return out;
};

const VariantMatrix = ({
	activeIdx,
	code,
	onPick,
	supported,
}: {
	activeIdx: number;
	code: string;
	onPick: (idx: number) => void;
	supported: Set<number> | null;
}) => {
	const visible = supported
		? VARIANTS.map((v, i) => ({ v, i })).filter(({ i }) => supported.has(i))
		: VARIANTS.map((v, i) => ({ v, i }));

	return (
		<div className={shared.section}>
			<SectionHead title="Variants">
				Selected glyph rendered across{" "}
				<NumberFlip value={visible.length} /> available styles.
			</SectionHead>
			<div className={styles.matrix}>
				{visible.map(({ v, i }, displayIdx) => (
					<button
						className={cn(
							styles.cell,
							i === activeIdx && styles.cellActive
						)}
						key={`${v.set}-${v.type ?? "x"}`}
						onClick={() => onPick(i)}
						style={{ animationDelay: `${displayIdx * 14}ms` }}
						type="button"
					>
						<div className={styles.cellGlyph}>
							{renderIcon(code, v.set, v.type, 28)}
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

const GlyphCatalog = ({
	activeCode,
	activeVariant,
	glyphs,
	iconData,
	onPick,
	onQuery,
	query,
	total,
}: {
	activeCode: string;
	activeVariant: Variant;
	glyphs: Glyph[];
	iconData: IconData | null;
	onPick: (c: string) => void;
	onQuery: (q: string) => void;
	query: string;
	total: number;
}) => (
	<div className={shared.section}>
		<SectionHead title="Glyphs">
			<NumberFlip value={total} /> common glyphs in{" "}
			<em>
				{activeVariant.family} {activeVariant.style}
			</em>
			.
		</SectionHead>
		<div className={styles.catalogSearch}>
			<svg
				aria-hidden="true"
				className={styles.searchIcon}
				height="14"
				viewBox="0 0 16 16"
				width="14"
			>
				<circle cx="7" cy="7" fill="none" r="5" stroke="currentColor" />
				<line stroke="currentColor" x1="11" x2="14" y1="11" y2="14" />
			</svg>
			<input
				className={styles.catalogInput}
				onChange={(e) => onQuery(e.target.value)}
				placeholder="Filter by name or unicode hex…"
				type="text"
				value={query}
			/>
			<span className={styles.catalogCount}>
				<NumberFlip value={glyphs.length} />/
				<NumberFlip value={total} />
			</span>
		</div>
		<div className={styles.catalog}>
			{glyphs.length === 0 ? (
				<div className={styles.catalogEmpty}>
					No matches for <em>"{query}"</em>
				</div>
			) : (
				glyphs.map((g, idx) => {
					const v = variantForGlyph(iconData, g.code, activeVariant);
					return (
					<button
						className={cn(
							styles.glyphCell,
							activeCode === g.code && styles.glyphCellActive
						)}
						key={g.code}
						onClick={() => onPick(g.code)}
						style={{
							animationDelay: `${Math.min(idx * 8, 400)}ms`,
						}}
						title={`${g.name} · ${g.code}`}
						type="button"
					>
						<div className={styles.glyphCellIcon}>
							{renderIcon(
								g.code,
								v.set,
								v.type,
								22
							)}
						</div>
						<span className={styles.glyphCellCode}>{g.code}</span>
						<span className={styles.glyphCellName}>{g.name}</span>
					</button>
				);
				})
			)}
		</div>
	</div>
);
