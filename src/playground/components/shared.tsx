import {
	type CSSProperties,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { cn } from "../../utils/cn";
import styles from "./shared.module.css";

export const Scrubber = ({
	value,
	onChange,
	min,
	max,
	ticks,
	unit = "px",
	label,
}: {
	value: number;
	onChange: (n: number) => void;
	min: number;
	max: number;
	ticks: number[];
	unit?: string;
	label: string;
}) => {
	const pctOf = (n: number) => ((n - min) / (max - min)) * 100;
	const pct = pctOf(value);
	return (
		<div className={styles.scrubber}>
			<div className={styles.scrubberValue} key={value}>
				<NumberFlip value={value} />
				<span className={styles.scrubberUnit}>{unit}</span>
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
					aria-label={label}
					className={styles.scrubberInput}
					max={max}
					min={min}
					onChange={(e) => onChange(Number(e.target.value))}
					step={1}
					type="range"
					value={value}
				/>
			</div>
			<div aria-hidden="true" className={styles.scrubberTicks}>
				{ticks.map((t) => (
					<button
						className={cn(styles.tick, value === t && styles.tickActive)}
						key={t}
						onClick={() => onChange(t)}
						style={{ "--tick-pos": `${pctOf(t)}%` } as CSSProperties}
						type="button"
					>
						{t}
					</button>
				))}
			</div>
		</div>
	);
};

export type TIconSizeStyle = CSSProperties & { "--iconSize"?: string };

export const iconSize = (px: number | string): TIconSizeStyle => ({
	"--iconSize": typeof px === "number" ? `${px}px` : px,
});

export const SectionHead = ({
	title,
	children,
}: {
	title: string;
	children?: ReactNode;
}) => (
	<header className={styles.sectionHead}>
		<h2 className={styles.sectionTitle}>{title}</h2>
		{children ? <p className={styles.sectionDesc}>{children}</p> : null}
	</header>
);

export const CopyButton = ({
	onCopy,
	label,
	className,
}: {
	onCopy: () => void | Promise<void>;
	label: string;
	className?: string;
}) => {
	const [copied, setCopied] = useState(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(
		() => () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		},
		[]
	);

	const handleClick = useCallback(async () => {
		try {
			await onCopy();
			setCopied(true);
			if (timerRef.current) clearTimeout(timerRef.current);
			timerRef.current = setTimeout(() => setCopied(false), 1400);
		} catch {
			// Clipboard may be unavailable or denied; leave button in idle state.
		}
	}, [onCopy]);

	return (
		<button
			aria-label={`Copy ${label}`}
			className={cn(styles.copyBtn, className)}
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
			<span className={styles.copyLabel}>{copied ? "COPIED" : label}</span>
		</button>
	);
};

export const NumberFlip = ({ value }: { value: number | string }) => {
	const str = String(value);
	return (
		<span className={styles.flipNum}>
			{str.split("").map((ch, i) => (
				<span className={styles.flipDigit} key={`${i}-${ch}`}>
					{ch}
				</span>
			))}
		</span>
	);
};

export const Preview = ({
	title,
	titleSize = "lg",
	meta,
	copyLabel,
	onCopy,
	footer,
	children,
}: {
	title: string;
	titleSize?: "lg" | "md";
	meta?: (string | null | undefined | false)[];
	copyLabel?: string;
	onCopy?: () => void;
	footer?: ReactNode;
	children: ReactNode;
}) => {
	const metaItems = meta?.filter(Boolean) as string[] | undefined;
	return (
		<div className={styles.preview}>
			<div className={styles.previewInfo}>
				<div className={styles.previewHead}>
					<div
						className={cn(
							styles.previewTitle,
							titleSize === "md" && styles.previewTitleMd,
						)}
						key={title}
					>
						{title}
					</div>
					{onCopy && copyLabel ? (
						<CopyButton label={copyLabel} onCopy={onCopy} />
					) : null}
				</div>
				{metaItems && metaItems.length > 0 ? (
					<div className={styles.previewMeta}>
						{metaItems.map((item, i) => (
							<span className={styles.metaItem} key={`${i}-${item}`}>
								{item}
							</span>
						))}
					</div>
				) : null}
			</div>
			<div className={styles.previewBody}>
				<div aria-hidden="true" className={styles.previewGrid} />
				<div className={styles.previewContent} key={title}>
					{children}
				</div>
			</div>
			{footer ? <div className={styles.previewFooter}>{footer}</div> : null}
		</div>
	);
};

export const Card = ({
	icon,
	label,
	meta,
	active,
	onClick,
	onMouseEnter,
	onMouseLeave,
	title,
}: {
	icon: ReactNode;
	label: string;
	meta?: string;
	active?: boolean;
	onClick: () => void;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	title?: string;
}) => (
	<button
		className={cn(styles.card, active && styles.cardActive)}
		onClick={onClick}
		onMouseEnter={onMouseEnter}
		onMouseLeave={onMouseLeave}
		title={title}
		type="button"
	>
		<div className={styles.cardIcon}>{icon}</div>
		<span className={styles.cardLabel}>{label}</span>
		{meta ? <span className={styles.cardMeta}>{meta}</span> : null}
	</button>
);

export const SearchBar = ({
	placeholder,
	value,
	onChange,
	matched,
	total,
}: {
	placeholder: string;
	value: string;
	onChange: (q: string) => void;
	matched: number;
	total: number;
}) => (
	<div className={styles.searchBar}>
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
			className={styles.searchInput}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			type="text"
			value={value}
		/>
		{value ? (
			<button
				aria-label="Clear search"
				className={styles.searchClear}
				onClick={() => onChange("")}
				type="button"
			>
				<svg
					aria-hidden="true"
					height="12"
					stroke="currentColor"
					strokeLinecap="round"
					strokeWidth="1.6"
					viewBox="0 0 16 16"
					width="12"
				>
					<line x1="4" x2="12" y1="4" y2="12" />
					<line x1="12" x2="4" y1="4" y2="12" />
				</svg>
			</button>
		) : null}
		<span className={styles.searchCount}>
			<NumberFlip value={matched} />/<NumberFlip value={total} />
		</span>
	</div>
);
