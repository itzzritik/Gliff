import { type DotLottie, DotLottieReact } from "@lottiefiles/dotlottie-react";
import { forwardRef, useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import styles from "./Lottie.module.css";

export const Lottie = forwardRef<HTMLDivElement, TLottieProps>((props, ref) => {
	const {
		className,
		src,
		size = "default",
		autoPlay = true,
		loop = true,
		speed = 1,
	} = props;

	const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);

	const lottieSize = `${typeof size === "number" ? size : LottieSize[size]}px`;
	const LottieClsx = cn("xLottie", styles.lottieWrapper, className);

	useEffect(() => {
		if (lottieSize) dotLottie?.resize();
	}, [dotLottie, lottieSize]);

	return (
		<div
			className={LottieClsx}
			ref={ref}
			style={{ ["--lottieSize" as string]: lottieSize }}
		>
			<DotLottieReact
				autoplay={autoPlay}
				className={styles.lottie}
				dotLottieRefCallback={setDotLottie}
				loop={loop}
				marker="lottie"
				speed={speed}
				src={src}
			/>
		</div>
	);
});

Lottie.displayName = "Lottie";

export const LottieSize = {
	mini: 64,
	default: 128,
	large: 256,
} as const;

export interface TLottieProps {
	className?: string;
	src: string;
	size?: number | keyof typeof LottieSize;
	controls?: boolean;
	autoPlay?: boolean;
	loop?: boolean;
	speed?: number;
}
