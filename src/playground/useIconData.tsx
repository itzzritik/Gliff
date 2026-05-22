import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { ASSETS_ICONS_JSON } from "../utils/assets";

export interface IconData {
	version: string;
	variants: string[];
	newVariants: string[];
	glyphs: Record<string, { n: string; v: number[] }>;
}

const Context = createContext<IconData | null>(null);

export const IconDataProvider = ({ children }: { children: ReactNode }) => {
	const [data, setData] = useState<IconData | null>(null);

	useEffect(() => {
		fetch(ASSETS_ICONS_JSON)
			.then((r) => r.json())
			.then(setData);
	}, []);

	return <Context.Provider value={data}>{children}</Context.Provider>;
};

export const useIconData = () => useContext(Context);
