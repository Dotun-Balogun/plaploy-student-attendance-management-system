import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client for server-only administrative actions
 * (e.g. creating auth users for new students/lecturers from the admin panel).
 *
 * Uses the Supabase "secret" key (sb_secret_...) — the modern replacement
 * for the legacy "service_role" key. This must NEVER be prefixed with
 * NEXT_PUBLIC_ and must never be imported from a Client Component.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
