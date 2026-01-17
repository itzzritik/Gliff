import clsx from "clsx";
import { forwardRef } from "react";
import { unicodeToString } from "../../utils";
import styles from "./Icon.module.css";
import { IconSize, type IIconProps } from "./types";

export const Icon = forwardRef<HTMLSpanElement, IIconProps>((props, ref) => {
	const {
		className,
		style = {},
		code,
		type = "light",
		size = "default",
		onClick,
	} = props;

	const iconSize = `${typeof size === "number" ? size : IconSize[size]}px`;
	const IconClsx = clsx(
		"xIcon",
		"fa", // FontAwesome class
		type,
		onClick && "iconButton",
		onClick && styles.iconButton,
		className
	);

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: Icon interaction handling
		<i
			ref={ref}
			className={IconClsx}
			style={{ ["--iconSize" as string]: iconSize, ...style }}
			data-content={unicodeToString(code)}
			role="img"
			onClick={onClick}
		/>
	);
});

Icon.displayName = "Icon";
