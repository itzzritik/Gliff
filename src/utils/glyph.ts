const UNICODE_PREFIX_REGEX = /^0x|^u\+?/i;
const MAX_UNICODE_CODE_POINT = 0x10_ff_ff;

export const toGlyph = (input: number | string): string => {
	const codePoint =
		typeof input === "number"
			? input
			: Number.parseInt(input.replace(UNICODE_PREFIX_REGEX, ""), 16);

	return Number.isInteger(codePoint) &&
		codePoint >= 0 &&
		codePoint <= MAX_UNICODE_CODE_POINT
		? String.fromCodePoint(codePoint)
		: "";
};
