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
