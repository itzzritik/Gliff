const CDN =
	"https://cdn.jsdelivr.net/gh/itzzjarvis/Assets@main/styles/fa/fa.css";

export const IonSetup = () => {
	return (
		<>
			<link rel="preload" href={CDN} as="style" />
			<link rel="stylesheet" href={CDN} />
		</>
	);
};
