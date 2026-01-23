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
		"fa",
		type,
		onClick && "iconButton",
		onClick && styles.iconButton,
		className
	);

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: suppress strict a11y check
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: suppress strict a11y check
		<i
			className={IconClsx}
			data-content={unicodeToString(code)}
			onClick={onClick}
			ref={ref}
			role="img"
			style={{ ["--iconSize" as string]: iconSize, ...style }}
		/>
	);
});

Icon.displayName = "Icon";
