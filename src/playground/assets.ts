const PORTFOLIO_API_BASE = import.meta.env.DEV
	? "http://localhost:4000/api"
	: "https://portfolio.ritik.me/api";

const ROOT = "https://cdn.jsdelivr.net/gh/itzzjarvis/Assets@main";

export const PLAYGROUND_LOTTIE_INDEX_URL = `${PORTFOLIO_API_BASE}/gliff/lottie-index`;
export const PLAYGROUND_LOTTIE_IMPORT_URL = `${PORTFOLIO_API_BASE}/gliff/import-lottie`;

export const playgroundLottieUrl = (slug: string) =>
	`${ROOT}/anim/lottie/${slug}.lottie`;
