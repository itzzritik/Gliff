import { type DotLottie, DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
	type CSSProperties,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import styles from "./Lottie.module.css";

const SAMPLES: { label: string; src: string; tag: string }[] = [
	{
		label: "Hello World",
		tag: "loop",
		src: "https://lottie.host/4db68bbd-31f6-4cd8-84eb-189de081159a/IGmMCqhzpt.lottie",
	},
	{
		label: "Pulse",
		tag: "loop",
		src: "https://assets1.lottiefiles.com/packages/lf20_jcikwtux.json",
	},
	{
		label: "Confetti",
		tag: "burst",
		src: "https://assets2.lottiefiles.com/packages/lf20_iv4dsx3q.json",
	},
	{
		label: "Loader",
		tag: "spin",
		src: "https://assets3.lottiefiles.com/packages/lf20_tutvdkg0.json",
	},
	{
		label: "Wave",
		tag: "ambient",
		src: "https://assets4.lottiefiles.com/packages/lf20_b88nh30c.json",
	},
];

const DEFAULT_SRC = SAMPLES[0].src;

export const LottieWorkbench = () => {
	const [src, setSrc] = useState(DEFAULT_SRC);
	const [size, setSize] = useState(240);
	const [speed, setSpeed] = useState(1);
	const [loop, setLoop] = useState(true);
	const [autoplay, setAutoplay] = useState(true);

	const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
	const [frame, setFrame] = useState(0);
	const [totalFrames, setTotalFrames] = useState(0);
	const [duration, setDuration] = useState(0);
	const [playing, setPlaying] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!dotLottie) return;
		setError(null);
		const onLoad = () => {
			setTotalFrames(dotLottie.totalFrames || 0);
			setDuration(dotLottie.duration || 0);
		};
		const onFrame = (e: { currentFrame: number }) =>
			setFrame(Math.round(e.currentFrame));
		const onPlay = () => setPlaying(true);
		const onPause = () => setPlaying(false);
		const onStop = () => setPlaying(false);
		const onError = (e: { error: { message?: string } }) =>
			setError(e.error?.message ?? "Failed to load");

		// Listener types in dotlottie-web vary across versions; cast for ergonomics.
		const dl = dotLottie as unknown as {
			addEventListener: (type: string, cb: (...args: never[]) => void) => void;
			removeEventListener: (
				type: string,
				cb: (...args: never[]) => void
			) => void;
		};
		dl.addEventListener("load", onLoad as never);
		dl.addEventListener("frame", onFrame as never);
		dl.addEventListener("play", onPlay as never);
		dl.addEventListener("pause", onPause as never);
		dl.addEventListener("stop", onStop as never);
		dl.addEventListener("loadError", onError as never);
		return () => {
			dl.removeEventListener("load", onLoad as never);
			dl.removeEventListener("frame", onFrame as never);
			dl.removeEventListener("play", onPlay as never);
			dl.removeEventListener("pause", onPause as never);
			dl.removeEventListener("stop", onStop as never);
			dl.removeEventListener("loadError", onError as never);
		};
	}, [dotLottie]);

	const handleSeek = useCallback(
		(f: number) => {
			if (!dotLottie) return;
			(dotLottie as unknown as { setFrame: (f: number) => void }).setFrame(f);
		},
		[dotLottie]
	);

	const togglePlay = useCallback(() => {
		if (!dotLottie) return;
		if (playing) dotLottie.pause();
		else dotLottie.play();
	}, [dotLottie, playing]);

	const stop = useCallback(() => {
		if (!dotLottie) return;
		dotLottie.stop();
	}, [dotLottie]);

	const speedTicks = [0.25, 0.5, 1, 1.5, 2, 3];

	const progress = totalFrames > 0 ? (frame / totalFrames) * 100 : 0;

	return (
		<div className={styles.workbench}>
			<aside className={styles.sidebar}>
				<div className={styles.stage}>
					<div className={styles.stageMarks} aria-hidden="true">
						<span>PREVIEW</span>
						<span>
							{error ? "ERROR" : playing ? "PLAYING" : "PAUSED"}
						</span>
					</div>
					<div className={styles.stageCanvas}>
						<div className={styles.stageGrid} aria-hidden="true" />
						<div className={styles.playerWrap}>
							<div
								className={styles.playerInner}
								style={
									{
										width: `${size}px`,
										height: `${size}px`,
									} as CSSProperties
								}
							>
								{error ? (
									<div className={styles.errBox}>
										<span className={styles.errLabel}>LOAD ERROR</span>
										<span className={styles.errMsg}>{error}</span>
									</div>
								) : (
									<DotLottieReact
										key={src}
										src={src}
										loop={loop}
										autoplay={autoplay}
										speed={speed}
										dotLottieRefCallback={setDotLottie}
										className={styles.player}
									/>
								)}
							</div>
						</div>
					</div>
				</div>

				<Transport
					playing={playing}
					onToggle={togglePlay}
					onStop={stop}
					frame={frame}
					totalFrames={totalFrames}
					progress={progress}
					onSeek={handleSeek}
				/>

				<div className={styles.telemetry}>
					<div className={styles.telemetryHead}>
						<span>PROPERTIES</span>
						<span>{playing ? "live" : "idle"}</span>
					</div>
					<TelemRow
						k="frame"
						v={`${frame}/${totalFrames || "—"}`}
					/>
					<TelemRow k="duration" v={`${duration.toFixed(2)}s`} />
					<TelemRow k="speed" v={`${speed.toFixed(2)}x`} />
					<TelemRow k="loop" v={loop ? "yes" : "no"} />
					<TelemRow k="autoplay" v={autoplay ? "yes" : "no"} />
					<TelemRow k="size" v={`${size}px`} />
				</div>
			</aside>

			<section className={styles.canvas}>
				<div className={styles.section}>
					<header className={styles.sectionHead}>
						<h2 className={styles.sectionTitle}>Source</h2>
						<p className={styles.sectionDesc}>
							Provide a remote .lottie or .json URL.
						</p>
					</header>
					<div className={styles.urlInput}>
						<span className={styles.urlPrefix}>src</span>
						<input
							type="text"
							value={src}
							onChange={(e) => setSrc(e.target.value)}
							className={styles.urlField}
							placeholder="https://lottie.host/…"
							spellCheck={false}
						/>
						<button
							type="button"
							className={styles.urlClear}
							onClick={() => setSrc(DEFAULT_SRC)}
						>
							RESET
						</button>
					</div>
					<div className={styles.samples}>
						{SAMPLES.map((s) => (
							<button
								type="button"
								key={s.src}
								className={`${styles.sampleCard} ${src === s.src ? styles.sampleCardActive : ""}`}
								onClick={() => setSrc(s.src)}
							>
								<div className={styles.samplePreview}>
									<DotLottieReact
										key={`${s.src}-mini`}
										src={s.src}
										autoplay
										loop
										className={styles.samplePlayer}
									/>
								</div>
								<div className={styles.sampleMeta}>
									<span className={styles.sampleLabel}>{s.label}</span>
									<span className={styles.sampleTag}>{s.tag}</span>
								</div>
							</button>
						))}
					</div>
				</div>

				<div className={styles.section}>
					<header className={styles.sectionHead}>
						<h2 className={styles.sectionTitle}>Controls</h2>
						<p className={styles.sectionDesc}>
							Configure size, playback speed, and looping.
						</p>
					</header>
					<div className={styles.controlsGrid}>
						<ControlSlider
							label="Size"
							value={size}
							onChange={setSize}
							min={64}
							max={480}
							unit="px"
						/>
						<ControlSlider
							label="Speed"
							value={speed}
							onChange={setSpeed}
							min={0.1}
							max={3}
							step={0.05}
							unit="x"
							ticks={speedTicks}
						/>
						<ControlSwitch
							label="Loop"
							hint="Repeat continuously"
							value={loop}
							onChange={setLoop}
						/>
						<ControlSwitch
							label="Autoplay"
							hint="Begin playback on load"
							value={autoplay}
							onChange={setAutoplay}
						/>
					</div>
				</div>
			</section>
		</div>
	);
};

/* ────────────────────────────────────────────────────────────────────── */

const Transport = ({
	playing,
	onToggle,
	onStop,
	frame,
	totalFrames,
	progress,
	onSeek,
}: {
	playing: boolean;
	onToggle: () => void;
	onStop: () => void;
	frame: number;
	totalFrames: number;
	progress: number;
	onSeek: (f: number) => void;
}) => {
	const trackRef = useRef<HTMLDivElement>(null);

	const seekFromEvent = (e: React.PointerEvent) => {
		const r = trackRef.current?.getBoundingClientRect();
		if (!r) return;
		const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
		onSeek(Math.round(pct * (totalFrames - 1)));
	};

	return (
		<div className={styles.transport}>
			<div className={styles.transportHead}>
				<span className={styles.transportLabel}>TIMELINE</span>
				<span className={styles.transportFrame}>
					<span className={styles.frameNow}>
						{String(frame).padStart(3, "0")}
					</span>
					<span className={styles.frameSep}>/</span>
					<span className={styles.frameMax}>
						{String(totalFrames).padStart(3, "0")}
					</span>
				</span>
			</div>
			<div
				ref={trackRef}
				className={styles.timeline}
				onPointerDown={(e) => {
					(e.target as HTMLElement).setPointerCapture(e.pointerId);
					seekFromEvent(e);
				}}
				onPointerMove={(e) => {
					if (e.buttons === 1) seekFromEvent(e);
				}}
			>
				<div
					className={styles.timelineFill}
					style={{ width: `${progress}%` }}
				/>
				<div
					className={styles.timelineHead}
					style={{ left: `${progress}%` }}
				/>
				<div className={styles.timelineTicks} aria-hidden="true">
					{Array.from({ length: 9 }, (_, idx) => (
						<span
							key={idx}
							className={styles.timelineTick}
							style={{ left: `${(idx / 8) * 100}%` }}
						/>
					))}
				</div>
			</div>
			<div className={styles.transportButtons}>
				<button
					type="button"
					className={styles.playBtn}
					onClick={onToggle}
					aria-label={playing ? "Pause" : "Play"}
				>
					{playing ? (
						<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
							<rect x="3" y="2" width="3.5" height="12" rx="0.5" />
							<rect x="9.5" y="2" width="3.5" height="12" rx="0.5" />
						</svg>
					) : (
						<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
							<path d="M3 2 L13 8 L3 14 Z" />
						</svg>
					)}
				</button>
				<button
					type="button"
					className={styles.stopBtn}
					onClick={onStop}
					aria-label="Stop"
				>
					<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
						<rect x="2" y="2" width="12" height="12" rx="1" />
					</svg>
				</button>
			</div>
		</div>
	);
};

const TelemRow = ({ k, v }: { k: string; v: string }) => {
	const [flash, setFlash] = useState(false);
	const prev = useRef(v);
	useEffect(() => {
		if (prev.current !== v) {
			setFlash(true);
			const t = setTimeout(() => setFlash(false), 600);
			prev.current = v;
			return () => clearTimeout(t);
		}
	}, [v]);
	return (
		<div className={styles.telemetryRow}>
			<span
				className={`${styles.measureMark} ${flash ? styles.measureMarkFlash : ""}`}
				aria-hidden="true"
			/>
			<dt className={styles.telemetryKey}>{k}</dt>
			<dd className={styles.telemetryVal}>{v}</dd>
		</div>
	);
};

const ControlSlider = ({
	label,
	value,
	onChange,
	min,
	max,
	step = 1,
	unit,
	ticks,
}: {
	label: string;
	value: number;
	onChange: (n: number) => void;
	min: number;
	max: number;
	step?: number;
	unit: string;
	ticks?: number[];
}) => (
	<div className={styles.control}>
		<div className={styles.controlHead}>
			<span className={styles.controlLabel}>{label}</span>
			<span className={styles.controlValue}>
				{value.toFixed(value % 1 ? 2 : 0)}
				<span className={styles.controlUnit}>{unit}</span>
			</span>
		</div>
		<input
			type="range"
			className={styles.controlRange}
			min={min}
			max={max}
			step={step}
			value={value}
			onChange={(e) => onChange(Number(e.target.value))}
		/>
		{ticks && (
			<div className={styles.controlTicks}>
				{ticks.map((t) => (
					<button
						key={t}
						type="button"
						className={`${styles.controlTick} ${
							Math.abs(value - t) < 0.01 ? styles.controlTickActive : ""
						}`}
						onClick={() => onChange(t)}
					>
						{t}
						{unit}
					</button>
				))}
			</div>
		)}
	</div>
);

const ControlSwitch = ({
	label,
	hint,
	value,
	onChange,
}: {
	label: string;
	hint: string;
	value: boolean;
	onChange: (v: boolean) => void;
}) => (
	<button
		type="button"
		className={styles.switch}
		onClick={() => onChange(!value)}
		data-state={value ? "on" : "off"}
	>
		<div className={styles.switchHead}>
			<span className={styles.controlLabel}>{label}</span>
			<span className={styles.switchTrack}>
				<span className={styles.switchKnob} />
			</span>
		</div>
		<span className={styles.switchHint}>{hint}</span>
	</button>
);

