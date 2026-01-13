import { fail } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import type { Actions, PageServerLoad } from './$types';

interface AdminUser {
    id: string;
    email: string;
    created_at: string;
    email_confirmed_at: string | null;
}

export const load: PageServerLoad = async () => {
    // List all users using service-role key
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return { users: [] as AdminUser[] };
    }

    // Map to simplified user objects
    const adminUsers: AdminUser[] = users.map(user => ({
        id: user.id,
        email: user.email || 'N/A',
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at || null
    }));

    return { users: adminUsers };
};

export const actions: Actions = {
    invite: async ({ request }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;

        if (!email) {
            return fail(400, { error: 'Email is required' });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return fail(400, { error: 'Invalid email format' });
        }

        try {
            const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

            if (error) {
                return fail(400, { error: error.message });
            }

            return { success: true, message: `Invitation sent to ${email}` };
        } catch (err) {
            console.error('Invite error:', err);
            return fail(500, { error: 'Failed to send invitation. Please try again.' });
        }
    }
};
