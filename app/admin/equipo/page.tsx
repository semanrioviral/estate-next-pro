import { createAdminClient } from '@/lib/supabase-server';
import AgentList from '@/components/admin/AgentList';

export const dynamic = 'force-dynamic';

export default async function AdminEquipo() {
    const supabase = createAdminClient();

    // 1. Obtener todos los usuarios de Auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('Error fetching auth users:', authError);
    }

    // 2. Obtener todos los perfiles
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');

    if (profileError) {
        console.error('Error fetching profiles:', profileError);
    }

    // 3. Mapear y combinar datos
    const allAgents = (users || []).map(user => {
        const profile = (profiles || []).find(p => p.id === user.id);
        const fullName = profile?.full_name || user.user_metadata?.full_name || 'Sin nombre';

        return {
            id: user.id,
            email: user.email || '',
            full_name: fullName,
            role: profile?.role || 'agente',
            created_at: user.created_at,
            invited_at: user.invited_at,
            confirmed_at: user.email_confirmed_at,
            is_pending: !user.email_confirmed_at && !!user.invited_at,
            has_profile: !!profile
        };
    });

    return (
        <AgentList initialAgents={allAgents} />
    );
}
