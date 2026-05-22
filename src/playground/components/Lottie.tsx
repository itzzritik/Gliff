import { type DotLottie, DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import styles from "./Lottie.module.css";
import { SectionHead } from "./shared";
import shared from "./shared.module.css";

interface Sample {
	label: string;
	src: string;
	tag: string;
}

const SAMPLES: Sample[] = [
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
const SPEED_TICKS = [0.25, 0.5, 1, 1.5, 2, 3];
const TIMELINE_TICK_COUNT = 9;
const TIMELINE_TICKS = Array.from({ length: TIMELINE_TICK_COUNT }, (_, i) => ({
	id: i,
	left: `${(i / (TIMELINE_TICK_COUNT - 1)) * 100}%`,
}));

interface DLBus {
	addEventListener: (type: string, cb: (e: never) => void) => void;
	removeEventListener: (type: string, cb: (e: never) => void) => void;
	setFrame: (f: number) => void;
}

const asBus = (dl: DotLottie) => dl as unknown as DLBus;

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
	const status = (() => {
		if (error) return "ERROR";
		if (playing) return "PLAYING";
		return "PAUSED";
	})();

	return (
		<div className={shared.workbench}>
			<aside className={shared.sidebar}>
				<div className={styles.stage}>
					<div aria-hidden="true" className={styles.stageMarks}>
						<span>PREVIEW</span>
						<span>{status}</span>
					</div>
					<div className={styles.stageCanvas}>
						<div aria-hidden="true" className={styles.stageGrid} />
						<div className={styles.playerWrap}>
							<div
								className={styles.playerInner}
								style={{
									height: `${size}px`,
									width: `${size}px`,
								}}
							>
								{error ? (
									<div className={styles.errBox}>
										<span className={styles.errLabel}>
											LOAD ERROR
										</span>
										<span className={styles.errMsg}>
											{error}
										</span>
									</div>
								) : (
									<DotLottieReact
										autoplay={autoplay}
										className={styles.player}
										dotLottieRefCallback={setDotLottie}
										key={src}
										loop={loop}
										speed={speed}
										src={src}
									/>
								)}
							</div>
						</div>
					</div>
				</div>

				<Transport
					frame={frame}
					onSeek={handleSeek}
					onStop={stop}
					onToggle={togglePlay}
					playing={playing}
					progress={progress}
					totalFrames={totalFrames}
				/>

				<div className={styles.telemetry}>
					<div className={styles.telemetryHead}>
						<span>PROPERTIES</span>
						<span>{playing ? "live" : "idle"}</span>
					</div>
					<TelemRow k="frame" v={`${frame}/${totalFrames || "—"}`} />
					<TelemRow k="duration" v={`${duration.toFixed(2)}s`} />
					<TelemRow k="speed" v={`${speed.toFixed(2)}x`} />
					<TelemRow k="loop" v={loop ? "yes" : "no"} />
					<TelemRow k="autoplay" v={autoplay ? "yes" : "no"} />
					<TelemRow k="size" v={`${size}px`} />
				</div>
			</aside>

			<section className={shared.canvas}>
				<div className={shared.section}>
					<SectionHead title="Source">
						Provide a remote .lottie or .json URL.
					</SectionHead>
					<div className={styles.urlInput}>
						<span className={styles.urlPrefix}>src</span>
						<input
							className={styles.urlField}
							onChange={(e) => setSrc(e.target.value)}
							placeholder="https://lottie.host/…"
							spellCheck={false}
							type="text"
							value={src}
						/>
						<button
							className={styles.urlClear}
							onClick={() => setSrc(DEFAULT_SRC)}
							type="button"
						>
							RESET
						</button>
					</div>
					<div className={styles.samples}>
						{SAMPLES.map((s) => (
							<button
								className={cn(
									styles.sampleCard,
									src === s.src && styles.sampleCardActive
								)}
								key={s.src}
								onClick={() => setSrc(s.src)}
								type="button"
							>
								<div className={styles.samplePreview}>
									<DotLottieReact
										autoplay
										className={styles.samplePlayer}
										key={`${s.src}-mini`}
										loop
										src={s.src}
									/>
								</div>
								<div className={styles.sampleMeta}>
									<span className={styles.sampleLabel}>
										{s.label}
									</span>
									<span className={styles.sampleTag}>
										{s.tag}
									</span>
								</div>
							</button>
						))}
					</div>
				</div>

				<div className={shared.section}>
					<SectionHead title="Controls">
						Configure size, playback speed, and looping.
					</SectionHead>
					<div className={styles.controlsGrid}>
						<ControlSlider
							label="Size"
							max={480}
							min={64}
							onChange={setSize}
							unit="px"
							value={size}
						/>
						<ControlSlider
							label="Speed"
							max={3}
							min={0.1}
							onChange={setSpeed}
							step={0.05}
							ticks={SPEED_TICKS}
							unit="x"
							value={speed}
						/>
						<ControlSwitch
							hint="Repeat continuously"
							label="Loop"
							onChange={setLoop}
							value={loop}
						/>
						<ControlSwitch
							hint="Begin playback on load"
							label="Autoplay"
							onChange={setAutoplay}
							value={autoplay}
						/>
					</div>
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
				<div aria-hidden="true" className={styles.timelineTicks}>
					{TIMELINE_TICKS.map((t) => (
						<span
							className={styles.timelineTick}
							key={t.id}
							style={{ left: t.left }}
						/>
					))}
				</div>
			</div>
			<div className={styles.transportButtons}>
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
			</div>
		</div>
	);
};

const TelemRow = ({ k, v }: { k: string; v: string }) => {
	const [flash, setFlash] = useState(false);
	const prev = useRef(v);
	useEffect(() => {
		if (prev.current === v) return;
		prev.current = v;
		setFlash(true);
		const t = setTimeout(() => setFlash(false), 600);
		return () => clearTimeout(t);
	}, [v]);
	return (
		<div className={styles.telemetryRow}>
			<span
				aria-hidden="true"
				className={cn(
					styles.measureMark,
					flash && styles.measureMarkFlash
				)}
			/>
			<dt className={styles.telemetryKey}>{k}</dt>
			<dd className={styles.telemetryVal}>{v}</dd>
		</div>
	);
};

interface ControlSliderProps {
	label: string;
	value: number;
	onChange: (n: number) => void;
	min: number;
	max: number;
	step?: number;
	unit: string;
	ticks?: number[];
}

const ControlSlider = ({
	label,
	max,
	min,
	onChange,
	step = 1,
	ticks,
	unit,
	value,
}: ControlSliderProps) => (
	<div className={styles.control}>
		<div className={styles.controlHead}>
			<span className={styles.controlLabel}>{label}</span>
			<span className={styles.controlValue}>
				{value.toFixed(value % 1 ? 2 : 0)}
				<span className={styles.controlUnit}>{unit}</span>
			</span>
		</div>
		<input
			className={styles.controlRange}
			max={max}
			min={min}
			onChange={(e) => onChange(Number(e.target.value))}
			step={step}
			type="range"
			value={value}
		/>
		{ticks ? (
			<div className={styles.controlTicks}>
				{ticks.map((t) => (
					<button
						className={cn(
							styles.controlTick,
							Math.abs(value - t) < 0.01 &&
								styles.controlTickActive
						)}
						key={t}
						onClick={() => onChange(t)}
						type="button"
					>
						{t}
						{unit}
					</button>
				))}
			</div>
		) : null}
	</div>
);

interface ControlSwitchProps {
	label: string;
	hint: string;
	value: boolean;
	onChange: (v: boolean) => void;
}

const ControlSwitch = ({
	hint,
	label,
	onChange,
	value,
}: ControlSwitchProps) => (
	<button
		className={styles.switch}
		data-state={value ? "on" : "off"}
		onClick={() => onChange(!value)}
		type="button"
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
