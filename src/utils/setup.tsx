import { ASSETS_FA_CSS as CDN } from "./assets";

type GliffProps =
	| { react: boolean; next?: boolean }
	| { react?: boolean; next: boolean };

export const Gliff = ({ react, next }: GliffProps) => {
	if (
		react &&
		typeof document !== "undefined" &&
		!document.querySelector(`link[href="${CDN}"]`)
	) {
		const link = document.createElement("link");
		link.rel = "preload";
		link.href = CDN;
		link.as = "style";
		document.head.appendChild(link);

		const link2 = document.createElement("link");
		link2.rel = "stylesheet";
		link2.href = CDN;
		document.head.appendChild(link2);
	}

	if (next) {
		return (
			<>
				<link as="style" href={CDN} rel="preload" />
				<link href={CDN} rel="stylesheet" />
			</>
		);
	}

	return null;
};
