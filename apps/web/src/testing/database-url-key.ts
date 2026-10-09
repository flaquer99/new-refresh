declare module "vitest" {
	export interface ProvidedContext {
		databaseUrl: string;
	}
}

export const DATABASE_URL_KEY = "databaseUrl";
