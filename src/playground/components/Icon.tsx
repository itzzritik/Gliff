import { useState } from "react";
import { Icon, type TIconProps } from "../../components/Icon/Icon";
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

export const IconPlayground = () => {
	const [code, setCode] = useState("f007");
	const [set, setSet] = useState<TIconProps["set"]>("classic");
	const [type, setType] = useState<TIconProps["type"]>("regular");
	const [size, setSize] = useState<TIconProps["size"]>("default");

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
						onChange={(e) =>
							setSet(e.target.value as TIconProps["set"])
						}
						value={set}
					>
						<option value="classic">Classic</option>
						<option value="duotone">Duotone</option>
						<option value="sharp">Sharp</option>
						<option value="sharp-duotone">Sharp Duotone</option>
						<option value="brand">Brand</option>
					</select>
				</div>

				<div className={styles.controlGroup}>
					<label className={styles.label} htmlFor="icon-type">
						Type
					</label>
					<select
						className={styles.select}
						id="icon-type"
						onChange={(e) =>
							setType(e.target.value as TIconProps["type"])
						}
						value={type}
					>
						<option value="thin">Thin</option>
						<option value="light">Light</option>
						<option value="regular">Regular</option>
						<option value="solid">Solid</option>
					</select>
				</div>

				<div className={styles.controlGroup}>
					<label className={styles.label} htmlFor="icon-size">
						Size
					</label>
					<select
						className={styles.select}
						id="icon-size"
						onChange={(e) =>
							setSize(e.target.value as TIconProps["size"])
						}
						value={size}
					>
						<option value="mini">Mini (12px)</option>
						<option value="default">Default (18px)</option>
						<option value="large">Large (24px)</option>
					</select>
				</div>
			</div>

			<div className={styles.previewArea}>
				<Icon code={code} set={set} size={size} type={type} />
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
									code={iconCode}
									set={set}
									size={size}
									type={type}
								/>
							</div>
							<span className={styles.gridItemCode}>
								{iconCode}
							</span>
						</button>
					))}
				</div>
			</div>
		</div>
	);
};
