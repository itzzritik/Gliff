import { useCallback, useEffect, useState } from "react";
import { PLAYGROUND_LOTTIE_INDEX_URL } from "./assets";

interface IndexJson {
	version?: string;
	files: string[];
}

export interface LottieIndex {
	files: string[] | null;
	addLocal: (slug: string) => void;
	replace: (files: string[]) => void;
}

const sameContent = (a: string[] | null, b: string[]): boolean => {
	if (!a || a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
	return true;
};

export const useLottieIndex = (): LottieIndex => {
	const [files, setFiles] = useState<string[] | null>(null);

	useEffect(() => {
		fetch(PLAYGROUND_LOTTIE_INDEX_URL, { credentials: "include" })
			.then((r) => r.json())
			.then((data: IndexJson) => setFiles(Array.isArray(data?.files) ? data.files : []))
			.catch(() => setFiles([]));
	}, []);

	const addLocal = useCallback((slug: string) => {
		setFiles((prev) => {
			if (prev?.includes(slug)) return prev;
			const next = [...(prev ?? []), slug];
			next.sort((a, b) => a.localeCompare(b));
			return next;
		});
	}, []);

	const replace = useCallback((next: string[]) => {
		const sorted = [...next].sort((a, b) => a.localeCompare(b));
		setFiles((prev) => (sameContent(prev, sorted) ? prev : sorted));
	}, []);

	return { files, addLocal, replace };
};
