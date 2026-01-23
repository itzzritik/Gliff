import { useState } from "react";
import { IconPlayground } from "./playground/components/icon";
import { LottiePlayground } from "./playground/components/lottie";
import styles from "./playground/Playground.module.css";

const App = () => {
	const [activeTab, setActiveTab] = useState<"icon" | "lottie">("icon");

	return (
		<div className={styles.layout}>
			<aside className={styles.sidebar}>
				<div className={styles.brand}>Playground</div>
				<nav className={styles.nav}>
					<button
						className={`${styles.navItem} ${activeTab === "icon" ? styles.navItemActive : ""}`}
						onClick={() => setActiveTab("icon")}
						type="button"
					>
						Icon
					</button>
					<button
						className={`${styles.navItem} ${activeTab === "lottie" ? styles.navItemActive : ""}`}
						onClick={() => setActiveTab("lottie")}
						type="button"
					>
						Lottie
					</button>
				</nav>
			</aside>
			<main className={styles.main}>
				{activeTab === "icon" ? (
					<IconPlayground />
				) : (
					<LottiePlayground />
				)}
			</main>
		</div>
	);
};

export default App;
