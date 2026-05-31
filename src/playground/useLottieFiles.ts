import { useCallback, useEffect, useRef, useState } from "react";

const GRAPHQL_URL = "https://graphql.lottiefiles.com/2022-08/";

export type LFTab = "featured" | "popular" | "search";

export interface LFItem {
	id: string;
	slug: string;
	name: string;
	dotLottieUrl: string;
	thumbnailUrl: string;
}

interface RawNode {
	id: number | string;
	slug: string;
	name: string;
	lottieUrl: string | null;
	jsonUrl: string | null;
	lottieFileType: string | null;
	imageUrl: string | null;
}

interface Connection {
	edges: { node: RawNode }[];
	pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

interface Resp {
	data?: Record<string, Connection | null>;
	errors?: { message: string }[];
}

const PAGE_SIZE = 100;

const QUERIES: Record<
	LFTab,
	{
		field: string;
		argsTemplate: (cursor: string | null, query?: string) => string;
	}
> = {
	featured: {
		field: "featuredPublicAnimations",
		argsTemplate: (cursor) =>
			`first: ${PAGE_SIZE}${cursor ? `, after: "${cursor}"` : ""}`,
	},
	popular: {
		field: "popularPublicAnimations",
		argsTemplate: (cursor) =>
			`first: ${PAGE_SIZE}${cursor ? `, after: "${cursor}"` : ""}`,
	},
	search: {
		field: "searchPublicAnimations",
		argsTemplate: (cursor, query) =>
			`query: ${JSON.stringify(query ?? "")}, first: ${PAGE_SIZE}${cursor ? `, after: "${cursor}"` : ""}`,
	},
};

const buildQuery = (tab: LFTab, cursor: string | null, query?: string) => {
	const { field, argsTemplate } = QUERIES[tab];
	return `{
		${field}(${argsTemplate(cursor, query)}) {
			edges { node { id slug name lottieUrl jsonUrl lottieFileType imageUrl } }
			pageInfo { hasNextPage endCursor }
		}
	}`;
};

const nodeToItem = (node: RawNode): LFItem | null => {
	if (!node.lottieUrl) return null;
	if (node.lottieFileType && node.lottieFileType.toLowerCase() !== "lottie")
		return null;
	return {
		id: String(node.id),
		slug: node.slug,
		name: node.name || node.slug,
		dotLottieUrl: node.lottieUrl,
		thumbnailUrl: node.imageUrl ?? "",
	};
};

const fetchPage = async (
	tab: LFTab,
	cursor: string | null,
	query?: string
): Promise<{ items: LFItem[]; nextCursor: string | null }> => {
	const res = await fetch(GRAPHQL_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ query: buildQuery(tab, cursor, query) }),
	});
	if (!res.ok) throw new Error(`graphql_${res.status}`);
	const json = (await res.json()) as Resp;
	if (json.errors?.length) throw new Error(json.errors[0].message);
	const conn = json.data?.[QUERIES[tab].field];
	if (!conn) return { items: [], nextCursor: null };
	const items = conn.edges
		.map((e) => nodeToItem(e.node))
		.filter((x): x is LFItem => Boolean(x));
	return {
		items,
		nextCursor: conn.pageInfo.hasNextPage ? conn.pageInfo.endCursor : null,
	};
};

export interface LottieFilesState {
	items: LFItem[];
	nextCursor: string | null;
	loading: boolean;
	error: string | null;
	loadMore: () => void;
}

export const useLottieFiles = (args: {
	tab: LFTab;
	query?: string;
	enabled?: boolean;
}): LottieFilesState => {
	const { tab, query, enabled = true } = args;
	const [items, setItems] = useState<LFItem[]>([]);
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const activeKeyRef = useRef("");
	const loadingRef = useRef(false);

	useEffect(() => {
		const key = `${enabled ? "on" : "off"}::${tab}::${query ?? ""}`;
		activeKeyRef.current = key;
		setItems([]);
		setNextCursor(null);
		setError(null);

		if (!enabled) {
			setLoading(false);
			return;
		}
		if (tab === "search" && !query?.trim()) {
			setLoading(false);
			return;
		}

		setLoading(true);
		fetchPage(tab, null, query)
			.then(({ items, nextCursor }) => {
				if (activeKeyRef.current !== key) return;
				setItems(items);
				setNextCursor(nextCursor);
			})
			.catch((err) => {
				if (activeKeyRef.current !== key) return;
				setError(err instanceof Error ? err.message : "graphql_error");
			})
			.finally(() => {
				if (activeKeyRef.current === key) setLoading(false);
			});
	}, [tab, query, enabled]);

	const loadMore = useCallback(() => {
		if (!(enabled && nextCursor) || loadingRef.current) return;
		const capturedKey = `on::${tab}::${query ?? ""}`;
		loadingRef.current = true;
		setLoading(true);
		fetchPage(tab, nextCursor, query)
			.then(({ items: more, nextCursor: next }) => {
				if (activeKeyRef.current !== capturedKey) return;
				setItems((prev) => [...prev, ...more]);
				setNextCursor(next);
			})
			.catch((err) => {
				if (activeKeyRef.current !== capturedKey) return;
				setError(err instanceof Error ? err.message : "graphql_error");
			})
			.finally(() => {
				loadingRef.current = false;
				if (activeKeyRef.current === capturedKey) setLoading(false);
			});
	}, [tab, query, nextCursor, enabled]);

	return { items, nextCursor, loading, error, loadMore };
};
