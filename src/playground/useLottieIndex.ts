import { useEffect, useState } from "react";
import { ASSETS_LOTTIE_INDEX } from "../utils/assets";

export const useLottieIndex = (): string[] | null => {
	const [files, setFiles] = useState<string[] | null>(null);

	useEffect(() => {
		fetch(ASSETS_LOTTIE_INDEX)
			.then((r) => r.json())
			.then((data) => setFiles(data.files));
	}, []);

	return files;
};
