import { useState } from "react";
import styles from "./App.module.css";
import { IconWorkbench } from "./playground/components/Icon";
import { LottieWorkbench } from "./playground/components/Lottie";
import "./playground/playground.css";
import { useTheme } from "./playground/useTheme";

declare const __APP_VERSION__: string;
const VERSION = `v${__APP_VERSION__}`;

type Tab = "icon" | "lottie";

const App = () => {
	const [tab, setTab] = useState<Tab>("icon");
	const { theme, toggle } = useTheme();

	return (
		<div className={styles.app}>
			<header className={styles.chrome}>
				<a
					className={styles.brand}
					href="/"
					aria-label={`Gliff ${VERSION}`}
					title={`Gliff · ${VERSION}`}
				>
					<span className={styles.brandMark} aria-hidden="true">
						<svg
							viewBox="0 0 32 32"
							width="28"
							height="28"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							{/* viewfinder corner brackets — preview / focus mark */}
							<path
								className={styles.brandCorner}
								data-corner="tl"
								d="M6 11 L6 6 L11 6"
							/>
							<path
								className={styles.brandCorner}
								data-corner="tr"
								d="M21 6 L26 6 L26 11"
							/>
							<path
								className={styles.brandCorner}
								data-corner="br"
								d="M26 21 L26 26 L21 26"
							/>
							<path
								className={styles.brandCorner}
								data-corner="bl"
								d="M11 26 L6 26 L6 21"
							/>
							<circle
								className={styles.brandCore}
								cx="16"
								cy="16"
								r="2.2"
								fill="var(--accent)"
								stroke="none"
							/>
						</svg>
					</span>
					<span className={styles.brandName} aria-hidden="true">
						<span className={styles.brandNameInner}>Gliff</span>
					</span>
					<span className={styles.brandSep} aria-hidden="true" />
					<span className={styles.brandVersion}>{VERSION}</span>
				</a>

				<nav className={styles.tabs} aria-label="Workbench">
					<div
						className={styles.tabIndicator}
						data-tab={tab}
						aria-hidden="true"
					/>
					<button
						type="button"
						className={`${styles.tab} ${tab === "icon" ? styles.tabActive : ""}`}
						onClick={() => setTab("icon")}
					>
						Icon
					</button>
					<button
						type="button"
						className={`${styles.tab} ${tab === "lottie" ? styles.tabActive : ""}`}
						onClick={() => setTab("lottie")}
					>
						Lottie
					</button>
				</nav>

				<div className={styles.meta}>
					<button
						type="button"
						className={styles.themeToggle}
						aria-label={
							theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
						}
						data-state={theme}
						onClick={(e) => {
							const rect = e.currentTarget.getBoundingClientRect();
							toggle({
								x: rect.left + rect.width / 2,
								y: rect.top + rect.height / 2,
							});
						}}
					>
						<svg
							className={`${styles.themeIcon} ${styles.themeIconSun}`}
							viewBox="0 0 24 24"
							width="18"
							height="18"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.6"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<circle cx="12" cy="12" r="4" />
							<line x1="12" y1="2" x2="12" y2="4" />
							<line x1="12" y1="20" x2="12" y2="22" />
							<line x1="2" y1="12" x2="4" y2="12" />
							<line x1="20" y1="12" x2="22" y2="12" />
							<line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
							<line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
							<line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
							<line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
						</svg>
						<svg
							className={`${styles.themeIcon} ${styles.themeIconMoon}`}
							viewBox="0 0 24 24"
							width="18"
							height="18"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.6"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
						</svg>
					</button>
				</div>
			</header>

			<main className={styles.main} key={tab}>
				{tab === "icon" ? <IconWorkbench /> : <LottieWorkbench />}
			</main>
		</div>
	);
};

export default App;
