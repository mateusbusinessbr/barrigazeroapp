import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getState, setState } from "@/lib/store";

/** beforeLoad for private routes (client-only, session lives in browser storage). getUser() revalidates with the auth server. */
export async function requireUser({ location }: { location: { href: string } }) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw redirect({ to: "/", search: { redirect: location.href } });
  if (!getState().user) {
    // Keep local (temporary) features working; display name only, never used for authorization.
    setState(() => ({
      user: { name: data.user.email?.split("@")[0] ?? "", email: data.user.email ?? "" },
    }));
  }
  return { user: data.user };
}

/** beforeLoad for login/signup: signed-in users go to the app. */
export async function redirectIfSignedIn() {
  const { data } = await supabase.auth.getUser();
  if (data.user) throw redirect({ to: "/painel" });
}

export function authErrorMessage(
  e: { message?: string | undefined; code?: string | undefined } | null | undefined,
): string {
  const m = (e?.message ?? "").toLowerCase();
  const c = e?.code ?? "";
  if (c === "invalid_credentials" || m.includes("invalid login"))
    return "E-mail ou senha incorretos.";
  if (c === "email_not_confirmed" || m.includes("not confirmed"))
    return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if (c === "user_already_exists" || m.includes("already registered"))
    return "Já existe uma conta com este e-mail.";
  if (c === "weak_password" || m.includes("password"))
    return "Senha fraca: use pelo menos 8 caracteres, misturando letras e números.";
  if (c === "over_email_send_rate_limit" || m.includes("rate limit"))
    return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
  if (m.includes("fetch") || m.includes("network"))
    return "Sem conexão. Verifique sua internet e tente novamente.";
  return "Não foi possível concluir. Tente novamente.";
}
