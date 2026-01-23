interface IonProps {
	react?: boolean;
}

const CDN =
	"https://cdn.jsdelivr.net/gh/itzzjarvis/Assets@main/styles/fa/fa.css";

export const Ion = ({ react }: IonProps) => {
	if (react && typeof document !== "undefined") {
		if (!document.querySelector(`link[href="${CDN}"]`)) {
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
		return null;
	}

	return (
		<>
			<link as="style" href={CDN} rel="preload" />
			<link href={CDN} rel="stylesheet" />
		</>
	);
};
