import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import { toGlyph } from "../../utils/glyph";
import "./Icon.css";

export const Icon = forwardRef<HTMLSpanElement, TIconProps>((props, ref) => {
	const { className, code, set = "classic", type, ...rest } = props;

	const resolvedType = type ?? DEFAULT_TYPE[set];
	const prefix = set === "classic" ? "" : set;
	const suffix = set === "brand" ? "" : (resolvedType ?? "");
	const iconStyle = `${prefix}${prefix && suffix ? "-" : ""}${suffix}`;

	return (
		<i
			className={cn("fa", iconStyle, className)}
			data-content={toGlyph(code)}
			ref={ref}
			role="img"
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
	chisel: "chisel",
	etch: "etch",
	graphite: "graphite",
	jelly: "jelly",
	"jelly-duo": "jelly-duo",
	"jelly-fill": "jelly-fill",
	notdog: "notdog",
	"notdog-duo": "notdog-duo",
	slab: "slab",
	"slab-press": "slab-press",
	thumbprint: "thumbprint",
	whiteboard: "whiteboard",
	utility: "utility",
	"utility-duo": "utility-duo",
	"utility-fill": "utility-fill",
} as const;

export const ICON_TYPES = {
	thin: "thin",
	light: "light",
	regular: "regular",
	semibold: "semibold",
	solid: "solid",
} as const;

const DEFAULT_TYPE = {
	classic: "regular",
	duotone: "solid",
	sharp: "regular",
	"sharp-duotone": "solid",
	brand: undefined,
	chisel: "regular",
	etch: "solid",
	graphite: "thin",
	jelly: "regular",
	"jelly-duo": "regular",
	"jelly-fill": "regular",
	notdog: "solid",
	"notdog-duo": "solid",
	slab: "regular",
	"slab-press": "regular",
	thumbprint: "light",
	whiteboard: "semibold",
	utility: "semibold",
	"utility-duo": "semibold",
	"utility-fill": "semibold",
} as const satisfies Record<keyof typeof ICON_SET, string | undefined>;

type TBaseProps = HTMLAttributes<HTMLElement> & { code: number | string };

type TSetTypeProps =
	| { set?: "classic"; type?: "thin" | "light" | "regular" | "solid" }
	| {
			set: "duotone" | "sharp" | "sharp-duotone";
			type?: "thin" | "light" | "regular" | "solid";
	  }
	| { set: "brand"; type?: never }
	| {
			set:
				| "chisel"
				| "slab"
				| "slab-press"
				| "jelly"
				| "jelly-duo"
				| "jelly-fill";
			type?: "regular";
	  }
	| { set: "etch" | "notdog" | "notdog-duo"; type?: "solid" }
	| { set: "graphite"; type?: "thin" }
	| { set: "thumbprint"; type?: "light" }
	| {
			set: "whiteboard" | "utility" | "utility-duo" | "utility-fill";
			type?: "semibold";
	  };

export type TIconProps = TBaseProps & TSetTypeProps;
