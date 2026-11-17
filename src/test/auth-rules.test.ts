import { describe, expect, it } from "vitest";
import { safeRedirect } from "@/lib/safe-redirect";
import { validatePassword, validateSignup } from "@/lib/validation";

describe("safeRedirect", () => {
  it("keeps same-origin paths", () => expect(safeRedirect("/dieta")).toBe("/dieta"));
  it("blocks external urls", () => expect(safeRedirect("https://evil.com")).toBe("/painel"));
  it("blocks protocol-relative urls", () => expect(safeRedirect("//evil.com")).toBe("/painel"));
  it("blocks backslash tricks", () => expect(safeRedirect("/\\evil.com")).toBe("/painel"));
});

describe("signup validation", () => {
  const ok = { name: "Ana", email: "ana@ex.com", pass: "senha123", confirm: "senha123" };
  it("accepts valid data", () => expect(validateSignup(ok)).toBeNull());
  it("requires a name", () => expect(validateSignup({ ...ok, name: " " })).not.toBeNull());
  it("rejects invalid email", () => expect(validateSignup({ ...ok, email: "ana@" })).not.toBeNull());
  it("requires 8+ chars", () => expect(validatePassword("abc1234", "abc1234")).not.toBeNull());
  it("requires letters and numbers", () => expect(validatePassword("abcdefgh", "abcdefgh")).not.toBeNull());
  it("requires matching confirmation", () => expect(validatePassword("senha123", "senha124")).not.toBeNull());
});
