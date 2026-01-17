export const LottieSize = {
	mini: 64,
	default: 128,
	large: 256,
} as const;

export type TLottieProps = {
	className?: string;
	src: string;
	size?: number | keyof typeof LottieSize;
	controls?: boolean;
	autoPlay?: boolean;
	loop?: boolean;
	speed?: number;
};
