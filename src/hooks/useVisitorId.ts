import { useEffect, useState } from "preact/hooks";

export function useVisitorId() {
	const [visitorId, setVisitorId] = useState<string | null>(null);

	useEffect(() => {
		const STORAGE_KEY = "@portfolio/visitor_id";
		let id = localStorage.getItem(STORAGE_KEY);

		if (!id) {
			id = crypto.randomUUID();
			localStorage.setItem(STORAGE_KEY, id);
		}

		setVisitorId(id);
	}, []);

	return visitorId;
}
