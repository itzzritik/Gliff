import { useState } from "react";
import { Lottie, type TLottieProps } from "../../components/Lottie/Lottie";
import styles from "../Playground.module.css";

const DEFAULT_LOTTIE =
	"https://lottie.host/80387612-4f30-4e3a-9694-811c79326e6d/6S8q6q6q6q.json";

export const LottiePlayground = () => {
	const [src, setSrc] = useState(DEFAULT_LOTTIE);
	const [size, setSize] = useState<TLottieProps["size"]>("default");
	const [speed, setSpeed] = useState("1");
	const [loop, setLoop] = useState(true);
	const [autoPlay, setAutoPlay] = useState(true);

	return (
		<div className={styles.card}>
			<div className={styles.header}>
				<h2 className={styles.title}>Lottie Component</h2>
				<p className={styles.subtitle}>Test dotLottie animations</p>
			</div>

			<div className={styles.controls}>
				<div
					className={styles.controlGroup}
					style={{ gridColumn: "span 2" }}
				>
					<label className={styles.label} htmlFor="lottie-url">
						Source URL
					</label>
					<input
						className={styles.input}
						id="lottie-url"
						onChange={(e) => setSrc(e.target.value)}
						placeholder="https://..."
						value={src}
					/>
				</div>

				<div className={styles.controlGroup}>
					<label className={styles.label} htmlFor="lottie-size">
						Size
					</label>
					<select
						className={styles.select}
						id="lottie-size"
						onChange={(e) =>
							setSize(e.target.value as TLottieProps["size"])
						}
						value={size}
					>
						<option value="mini">Mini (64px)</option>
						<option value="default">Default (128px)</option>
						<option value="large">Large (256px)</option>
					</select>
				</div>

				<div className={styles.controlGroup}>
					<label className={styles.label} htmlFor="lottie-speed">
						Speed
					</label>
					<input
						className={styles.input}
						id="lottie-speed"
						max="3"
						min="0.1"
						onChange={(e) => setSpeed(e.target.value)}
						step="0.1"
						type="number"
						value={speed}
					/>
				</div>

				<div className={styles.controlGroup}>
					<span className={styles.label}>Options</span>
					<div
						style={{
							display: "flex",
							gap: "16px",
							marginTop: "8px",
						}}
					>
						<label className={styles.checkboxLabel}>
							<input
								checked={loop}
								onChange={(e) => setLoop(e.target.checked)}
								type="checkbox"
							/>
							Loop
						</label>
						<label className={styles.checkboxLabel}>
							<input
								checked={autoPlay}
								onChange={(e) => setAutoPlay(e.target.checked)}
								type="checkbox"
							/>
							AutoPlay
						</label>
					</div>
				</div>
			</div>

			<div className={styles.previewArea}>
				<Lottie
					autoPlay={autoPlay}
					loop={loop}
					size={size}
					speed={Number(speed)}
					src={src}
				/>
			</div>
		</div>
	);
};
