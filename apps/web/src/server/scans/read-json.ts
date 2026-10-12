export const readJson = async (body: Body): Promise<unknown> => {
	try {
		return await body.json();
	} catch {
		return null;
	}
};
