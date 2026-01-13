import { redirect, type Handle } from '@sveltejs/kit';
import { supabasePublic } from '$lib/server/supabase';

export const handle: Handle = async ({ event, resolve }) => {
    // Admin route protection
    if (event.url.pathname.startsWith('/admin')) {
        // Public admin routes (login, reset password)
        const isPublicAdminRoute =
            event.url.pathname === '/admin/login' ||
            event.url.pathname.startsWith('/admin/reset-password');

        if (!isPublicAdminRoute) {
            const accessToken = event.cookies.get('sb-access-token');
            const refreshToken = event.cookies.get('sb-refresh-token');

            if (!accessToken) {
                // If we implemented refresh logic, we would use refresh token here.
                // For now, simple redirect.
                throw redirect(303, '/admin/login');
            }

            // Verify the token
            const { data: { user }, error } = await supabasePublic.auth.getUser(accessToken);

            if (error || !user) {
                // Invalid token
                event.cookies.delete('sb-access-token', { path: '/' });
                event.cookies.delete('sb-refresh-token', { path: '/' });
                throw redirect(303, '/admin/login');
            }

            // Set user in locals for usage in pages
            event.locals.user = user;
        }
    }

    return resolve(event);
};
