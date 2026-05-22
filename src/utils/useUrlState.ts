import { useCallback, useEffect, useState } from "react";

const readParam = (key: string, fallback: string): string => {
	if (typeof window === "undefined") return fallback;
	return new URLSearchParams(window.location.search).get(key) ?? fallback;
};

const writeParam = (key: string, value: string, defaultValue: string) => {
	if (typeof window === "undefined") return;
	const params = new URLSearchParams(window.location.search);
	if (value === defaultValue) params.delete(key);
	else params.set(key, value);
	const search = params.toString();
	const next = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
	window.history.replaceState(null, "", next);
};

export const useUrlState = (key: string, defaultValue: string) => {
	const [value, setValue] = useState(() => readParam(key, defaultValue));

	useEffect(() => {
		const onPop = () => setValue(readParam(key, defaultValue));
		window.addEventListener("popstate", onPop);
		return () => window.removeEventListener("popstate", onPop);
	}, [key, defaultValue]);

	const update = useCallback(
		(next: string) => {
			setValue(next);
			writeParam(key, next, defaultValue);
		},
		[key, defaultValue],
	);

	return [value, update] as const;
};
