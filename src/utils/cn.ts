export const cn = (...inputs: (string | undefined | null | false)[]) =>
	inputs.filter(Boolean).join(" ");
