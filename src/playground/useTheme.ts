import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "gliff-theme";

const getInitial = (): Theme => {
	if (typeof document === "undefined") return "dark";
	const attr = document.documentElement.getAttribute("data-theme");
	return attr === "light" ? "light" : "dark";
};

export const useTheme = () => {
	const [theme, setTheme] = useState<Theme>(getInitial);

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
		try {
			localStorage.setItem(STORAGE_KEY, theme);
		} catch {}
	}, [theme]);

	const toggle = useCallback((origin?: { x: number; y: number }) => {
		const next: Theme =
			document.documentElement.getAttribute("data-theme") === "light"
				? "dark"
				: "light";

		if (origin) {
			document.documentElement.style.setProperty(
				"--theme-x",
				`${origin.x}px`
			);
			document.documentElement.style.setProperty(
				"--theme-y",
				`${origin.y}px`
			);
		}

		const startTransition = (
			document as Document & {
				startViewTransition?: (cb: () => void) => unknown;
			}
		).startViewTransition;

		if (typeof startTransition === "function") {
			startTransition.call(document, () => {
				setTheme(next);
			});
		} else {
			setTheme(next);
		}
	}, []);

	return { theme, toggle } as const;
};
