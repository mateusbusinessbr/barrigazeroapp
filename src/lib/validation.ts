export const MIN_PASSWORD = 8;

export function validateSignup(f: {
  name: string;
  email: string;
  pass: string;
  confirm: string;
}): string | null {
  if (!f.name.trim()) return "Informe seu nome.";
  if (f.name.trim().length > 80) return "Nome muito longo (máx. 80 caracteres).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) return "Informe um e-mail válido.";
  return validatePassword(f.pass, f.confirm);
}

export function validatePassword(pass: string, confirm: string): string | null {
  if (pass.length < MIN_PASSWORD)
    return `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`;
  if (!/[a-zA-Z]/.test(pass) || !/\d/.test(pass)) return "A senha precisa ter letras e números.";
  if (pass !== confirm) return "As senhas não conferem.";
  return null;
}
