import type { Head } from "../types";

export function filterHeadsData(
    allHeads: Head[],
    query: string,
    category: string
): Head[] {
    const lowerQuery = query.toLowerCase();

    return allHeads.filter((h) => {
        const matchesQuery =
            h.name.toLowerCase().includes(lowerQuery) ||
            h.tags.some((t) => t.toLowerCase().includes(lowerQuery));
        const matchesCategory = category === "" || h.category === category;
        return matchesQuery && matchesCategory;
    });
}
