type GliffProps =
	| { react: boolean; next?: boolean }
	| { react?: boolean; next: boolean };

const CDN =
	"https://cdn.jsdelivr.net/gh/itzzjarvis/Assets@f2c70b85964f2ee09d0156c041e567e8b841ea32/styles/fa/fa.css";

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
