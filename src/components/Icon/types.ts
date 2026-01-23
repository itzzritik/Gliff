import type { CSSProperties } from "react";

export interface IIconProps {
	className?: string;
	style?: CSSProperties;
	code: string;
	type?: keyof typeof IconType;
	size?: number | keyof typeof IconSize;
	onClick?: (e?: React.MouseEvent<HTMLElement>) => void;
}

export const IconType = {
	thin: "thin",
	light: "light",
	regular: "regular",
	solid: "solid",
	duotone: "duotone",
	sharpSolid: "sharpSolid",
	sharpRegular: "sharpRegular",
	sharpLight: "sharpLight",
	brand: "brand",
} as const;

export const IconSize = {
	mini: 12,
	default: 18,
	large: 24,
} as const;
