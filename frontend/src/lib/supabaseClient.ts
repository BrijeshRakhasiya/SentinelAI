import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL ?? "";
const supabaseKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY ?? "";

if (!supabaseUrl || !supabaseKey) {
  // eslint-disable-next-line no-console
  console.error(
    "Missing REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_PUBLISHABLE_KEY -- login will not work."
  );
}

/** Single shared Supabase client: owns the session (auto-persisted in
 * localStorage, auto-refreshed) that both auth and the API client read from. */
export const supabase = createClient(supabaseUrl, supabaseKey);
