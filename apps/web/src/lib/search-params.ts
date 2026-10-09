export type SearchParams = Record<string, string | string[] | undefined>;

export const firstParam = (
	params: SearchParams,
	name: string,
): string | undefined => {
	const value = params[name];
	return Array.isArray(value) ? value[0] : value;
};
