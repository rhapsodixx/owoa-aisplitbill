import { fail, redirect } from '@sveltejs/kit';
import { supabasePublic } from '$lib/server/supabase';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    // If already logged in, redirect to dashboard
    // We'll check locals.user which will be populated by hooks
    // But for now, since hooks aren't ready, we'll skip this check
    // or we can implement it assuming hooks will check cookies.
    // For now, let's keep it simple.
    return {};
};

export const actions: Actions = {
    login: async ({ request, cookies }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            return fail(400, { error: 'Email and password are required' });
        }

        const { data, error } = await supabasePublic.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return fail(401, { error: error.message });
        }

        if (data.session) {
            cookies.set('sb-access-token', data.session.access_token, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });

            cookies.set('sb-refresh-token', data.session.refresh_token, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });
        }

        throw redirect(303, '/admin/dashboard');
    }
};
