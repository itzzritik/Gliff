import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";
import { toGlyph } from "../../utils";
import styles from "./Icon.module.css";

export const Icon = forwardRef<HTMLSpanElement, TIconProps>((props, ref) => {
	const {
		className,
		code,
		set = "classic",
		type = "regular",
		size = "default",
		style = {},
		...rest
	} = props;

	const prefix = set === "classic" ? "" : set;
	const suffix = set === "brand" ? "" : type;
	const iconStyle = `${prefix}${prefix && suffix ? "-" : ""}${suffix}`;
	const iconSize = `${typeof size === "number" ? size : IconSize[size]}px`;

	return (
		<i
			className={clsx(
				"xIcon fa",
				iconStyle,
				props.onClick && styles.iconButton,
				className
			)}
			data-content={toGlyph(code)}
			ref={ref}
			role="img"
			style={{ ["--iconSize" as string]: iconSize, ...style }}
			{...rest}
		/>
	);
});

Icon.displayName = "Icon";

export const ICON_SET = {
	classic: "classic",
	duotone: "duotone",
	sharp: "sharp",
	"sharp-duotone": "sharp-duotone",
	brand: "brand",
} as const;

export const ICON_TYPES = {
	thin: "thin",
	light: "light",
	regular: "regular",
	solid: "solid",
} as const;

export const IconSize = {
	mini: 12,
	default: 18,
	large: 24,
} as const;

export type TIconProps = HTMLAttributes<HTMLElement> & {
	code: number | string;
	set?: keyof typeof ICON_SET;
	type?: keyof typeof ICON_TYPES;
	size?: number | keyof typeof IconSize;
};
