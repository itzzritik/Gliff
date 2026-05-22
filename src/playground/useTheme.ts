import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "gliff-theme";

const getInitial = (): Theme => {
	if (typeof document === "undefined") return "dark";
	return document.documentElement.getAttribute("data-theme") === "light"
		? "light"
		: "dark";
};

export const useTheme = () => {
	const [theme, setTheme] = useState<Theme>(getInitial);

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
		try {
			localStorage.setItem(STORAGE_KEY, theme);
		} catch {
			// Storage may be unavailable (private browsing, quota); pre-paint script handles read fallback.
		}
	}, [theme]);

	const toggle = useCallback((origin?: { x: number; y: number }) => {
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

		const swap = () =>
			setTheme((prev) => (prev === "light" ? "dark" : "light"));

		if (typeof document.startViewTransition === "function") {
			document.startViewTransition(swap);
		} else {
			swap();
		}
	}, []);

	return { theme, toggle } as const;
};
