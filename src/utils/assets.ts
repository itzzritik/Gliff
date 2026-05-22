const SHA = "3d4facfe0f6f8831be732ebd1692620649d13ba3";
const ROOT = `https://cdn.jsdelivr.net/gh/itzzjarvis/Assets@${SHA}`;

export const ASSETS_FA_CSS = `${ROOT}/styles/fa/fa.css`;
export const ASSETS_ICONS_JSON = `${ROOT}/styles/fa/icons.json`;
export const ASSETS_LOTTIE_INDEX = `${ROOT}/anim/lottie/index.json`;
export const lottieUrl = (name: string) => `${ROOT}/anim/lottie/${name}.lottie`;
