declare module 'cloudflare:test' {
	interface ProvidedEnv extends Env {
		FIREBASE_PROJECT_ID: string;
		FIREBASE_CLIENT_EMAIL: string;
		FIREBASE_PRIVATE_KEY: string;
		WHATSAPP_PHONE_NUMBER_ID: string;
		WHATSAPP_VERIFY_TOKEN: string;
		WHATSAPP_ACCESS_TOKEN: string;
	}
}
