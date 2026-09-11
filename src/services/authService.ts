import { apiFetch } from "./apiClient";

export interface SetPasswordPayload {
  email: string;
  token: string;
  password: string;
  passwordConfirmation: string;
}

interface AuthDto {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "customer" | "admin";
    staff_role: string | null;
  };
}

export async function setPassword(payload: SetPasswordPayload): Promise<AuthDto> {
  return apiFetch<AuthDto>("/auth/set-password", {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      token: payload.token,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
    }),
  });
}

/** identifier is either an email address (staff login) or a Customer ID /
 * reference (customer login) — the backend resolves whichever it is. */
export async function login(identifier: string, password: string): Promise<AuthDto> {
  return apiFetch<AuthDto>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: identifier, password }),
  });
}
