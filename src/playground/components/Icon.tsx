import { useState } from "react";
import {
	Icon,
	ICON_SET,
	type TIconProps,
} from "../../components/Icon/Icon";
import styles from "../Playground.module.css";

const EXAMPLE_ICONS = [
	"f007", // user
	"f015", // home
	"f013", // cog
	"f002", // search
	"f054", // chevron-right
	"f067", // plus
	"f00c", // check
	"f00d", // xmark
	"f0e0", // envelope
	"f095", // phone
];

type TSet = NonNullable<TIconProps["set"]>;
type TType = NonNullable<TIconProps["type"]>;

const SET_LABEL: Record<TSet, string> = {
	classic: "Classic",
	duotone: "Duotone",
	sharp: "Sharp",
	"sharp-duotone": "Sharp Duotone",
	brand: "Brand",
	chisel: "Chisel",
	etch: "Etch",
	graphite: "Graphite",
	jelly: "Jelly",
	"jelly-duo": "Jelly Duo",
	"jelly-fill": "Jelly Fill",
	notdog: "Notdog",
	"notdog-duo": "Notdog Duo",
	slab: "Slab",
	"slab-press": "Slab Press",
	thumbprint: "Thumbprint",
	whiteboard: "Whiteboard",
	utility: "Utility",
	"utility-duo": "Utility Duo",
	"utility-fill": "Utility Fill",
};

const STANDARD_TYPES = ["thin", "light", "regular", "solid"] as const;

const SET_TYPES: Record<TSet, readonly TType[]> = {
	classic: STANDARD_TYPES,
	duotone: STANDARD_TYPES,
	sharp: STANDARD_TYPES,
	"sharp-duotone": STANDARD_TYPES,
	brand: [],
	chisel: ["regular"],
	etch: ["solid"],
	graphite: ["thin"],
	jelly: ["regular"],
	"jelly-duo": ["regular"],
	"jelly-fill": ["regular"],
	notdog: ["solid"],
	"notdog-duo": ["solid"],
	slab: ["regular"],
	"slab-press": ["regular"],
	thumbprint: ["light"],
	whiteboard: ["semibold"],
	utility: ["semibold"],
	"utility-duo": ["semibold"],
	"utility-fill": ["semibold"],
};

const SET_GROUPS: { label: string; sets: TSet[] }[] = [
	{
		label: "Classic & Duotone",
		sets: ["classic", "duotone", "sharp", "sharp-duotone"],
	},
	{ label: "Brand", sets: ["brand"] },
	{ label: "Chisel / Etch / Graphite", sets: ["chisel", "etch", "graphite"] },
	{ label: "Jelly", sets: ["jelly", "jelly-duo", "jelly-fill"] },
	{ label: "Notdog", sets: ["notdog", "notdog-duo"] },
	{ label: "Slab", sets: ["slab", "slab-press"] },
	{ label: "Thumbprint / Whiteboard", sets: ["thumbprint", "whiteboard"] },
	{ label: "Utility", sets: ["utility", "utility-duo", "utility-fill"] },
];

export const IconPlayground = () => {
	const [code, setCode] = useState("f007");
	const [set, setSet] = useState<TSet>("classic");
	const [type, setType] = useState<TType | undefined>("regular");
	const [size, setSize] = useState<number>(24);

	const validTypes = SET_TYPES[set];
	const typeDisabled = validTypes.length <= 1;

	const handleSetChange = (next: TSet) => {
		setSet(next);
		const nextTypes = SET_TYPES[next];
		if (nextTypes.length === 0) {
			setType(undefined);
		} else if (!type || !nextTypes.includes(type)) {
			setType(nextTypes[0]);
		}
	};

	const iconProps = {
		code,
		set,
		type,
		style: { ["--iconSize" as string]: `${size}px` },
	} as TIconProps;

	return (
		<div className={styles.card}>
			<div className={styles.header}>
				<h2 className={styles.title}>Icon Component</h2>
				<p className={styles.subtitle}>Test and preview font icons</p>
			</div>

			<div className={styles.controls}>
				<div className={styles.controlGroup}>
					<label className={styles.label} htmlFor="icon-code">
						Unicode
					</label>
					<input
						className={styles.input}
						id="icon-code"
						onChange={(e) => setCode(e.target.value)}
						value={code}
					/>
				</div>

				<div className={styles.controlGroup}>
					<label className={styles.label} htmlFor="icon-set">
						Set
					</label>
					<select
						className={styles.select}
						id="icon-set"
						onChange={(e) => handleSetChange(e.target.value as TSet)}
						value={set}
					>
						{SET_GROUPS.map((group) => (
							<optgroup key={group.label} label={group.label}>
								{group.sets.map((s) => (
									<option key={s} value={s}>
										{SET_LABEL[s]}
									</option>
								))}
							</optgroup>
						))}
					</select>
				</div>

				<div className={styles.controlGroup}>
					<label className={styles.label} htmlFor="icon-type">
						Type
					</label>
					<select
						className={styles.select}
						disabled={typeDisabled}
						id="icon-type"
						onChange={(e) => setType(e.target.value as TType)}
						value={type ?? ""}
					>
						{validTypes.length === 0 ? (
							<option value="">—</option>
						) : (
							validTypes.map((t) => (
								<option key={t} value={t}>
									{t.charAt(0).toUpperCase() + t.slice(1)}
								</option>
							))
						)}
					</select>
				</div>

				<div className={styles.controlGroup}>
					<label className={styles.label} htmlFor="icon-size">
						Size (px)
					</label>
					<input
						className={styles.input}
						id="icon-size"
						onChange={(e) => setSize(Number(e.target.value) || 0)}
						type="number"
						value={size}
					/>
				</div>
			</div>

			<div className={styles.previewArea}>
				<Icon {...iconProps} />
			</div>

			<div style={{ marginTop: 40 }}>
				<h3 className={styles.title} style={{ fontSize: 18 }}>
					Examples
				</h3>
				<div className={styles.grid}>
					{EXAMPLE_ICONS.map((iconCode) => (
						<button
							className={styles.gridItem}
							key={iconCode}
							onClick={() => setCode(iconCode)}
							type="button"
						>
							<div className={styles.gridItemIcon}>
								<Icon
									{...({
										...iconProps,
										code: iconCode,
									} as TIconProps)}
								/>
							</div>
							<span className={styles.gridItemCode}>
								{iconCode}
							</span>
						</button>
					))}
				</div>
			</div>

			<div style={{ marginTop: 40 }}>
				<h3 className={styles.title} style={{ fontSize: 18 }}>
					All Sets ({Object.keys(ICON_SET).length})
				</h3>
				<div className={styles.grid}>
					{(Object.keys(ICON_SET) as TSet[]).map((s) => {
						const t = SET_TYPES[s][0];
						return (
							<button
								className={styles.gridItem}
								key={s}
								onClick={() => handleSetChange(s)}
								type="button"
							>
								<div className={styles.gridItemIcon}>
									<Icon
										{...({
											code,
											set: s,
											type: t,
											style: {
												["--iconSize" as string]:
													`${size}px`,
											},
										} as TIconProps)}
									/>
								</div>
								<span className={styles.gridItemCode}>
									{SET_LABEL[s]}
								</span>
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
};
