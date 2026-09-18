import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client.
 *
 * Uses the new Supabase "publishable" API key (sb_publishable_...) rather
 * than the legacy "anon" key naming. The publishable key is safe to expose
 * to the browser — it only grants access permitted by your Row Level
 * Security (RLS) policies.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
