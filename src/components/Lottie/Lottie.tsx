import { type DotLottie, DotLottieReact } from "@lottiefiles/dotlottie-react";
import clsx from "clsx";
import { forwardRef, useEffect, useState } from "react";
import styles from "./Lottie.module.css";
import { LottieSize, type TLottieProps } from "./types";

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
	const LottieClsx = clsx("xLottie", styles.lottieWrapper, className);

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
