import type { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { setState } from "@/lib/store";

/** Ends the session; local diet data stays on the device (to be migrated in a later step). */
export async function signOut(navigate: ReturnType<typeof useNavigate>) {
  await supabase.auth.signOut();
  setState(() => ({ user: null }));
  navigate({ to: "/", replace: true });
}
