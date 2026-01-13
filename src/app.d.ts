/// <reference types="svelte" />
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: import('@supabase/supabase-js').User;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	const __APP_VERSION__: string;
}

export { };
