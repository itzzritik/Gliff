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
	className,
	appearance = "default",
}: {
	onCopy: () => void | Promise<void>;
	className?: string;
	appearance?: "default" | "dark";
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
			aria-label="Copy"
			className={cn(
				styles.copyBtn,
				appearance === "dark" && styles.copyBtnDark,
				className
			)}
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
