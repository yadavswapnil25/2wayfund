import { apiFetch } from "./apiClient";

export interface SetPasswordPayload {
  email: string;
  token: string;
  password: string;
  passwordConfirmation: string;
}

interface AuthUserDto {
  id: number;
  name: string;
  email: string;
  role: "customer" | "admin";
  staff_role: string | null;
}

interface AuthDto {
  token: string;
  user: AuthUserDto;
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

interface LoginDto {
  pin_required: boolean;
  token?: string;
  user?: AuthUserDto;
  challenge?: string;
}

/** login() never establishes a session by itself for an account with an
 * active Security PIN — it returns a one-time challenge instead, and the
 * caller must complete verifyLoginPin() with the correct 6-digit code
 * before a token exists at all. An account with no Security PIN
 * configured resolves in one step, exactly as before this feature
 * existed. */
export type LoginResult = { pinRequired: false; token: string; user: AuthUserDto } | { pinRequired: true; challenge: string };

/** identifier is either an email address (staff login) or a Customer ID /
 * reference (customer login) — the backend resolves whichever it is. */
export async function login(identifier: string, password: string): Promise<LoginResult> {
  const dto = await apiFetch<LoginDto>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: identifier, password }),
  });

  if (dto.pin_required) {
    return { pinRequired: true, challenge: dto.challenge ?? "" };
  }

  return { pinRequired: false, token: dto.token ?? "", user: dto.user as AuthUserDto };
}

/** The second step of login for an account with an active Security PIN —
 * challenge must be the exact value login() just returned for this same
 * identifier. Only success here actually establishes a session. */
export async function verifyLoginPin(identifier: string, challenge: string, pin: string): Promise<AuthDto> {
  return apiFetch<AuthDto>("/auth/verify-pin", {
    method: "POST",
    body: JSON.stringify({ email: identifier, challenge, pin }),
  });
}

/** "Forgot Security PIN?" from the login screen's PIN step — proves
 * identity with account number + Aadhaar (both must belong to the same
 * account) instead of the forgotten PIN, then an emailed one-time code.
 * Success turns the Security PIN off entirely and signs the customer in;
 * they can set a new one from 9-Digit PIN & Security afterward. */
export async function initiateSecurityPinRecovery(accountNumber: string, aadhaar: string): Promise<void> {
  await apiFetch<null>("/auth/security-pin/recover/initiate", {
    method: "POST",
    body: JSON.stringify({ account_number: accountNumber, aadhaar }),
  });
}

export async function confirmSecurityPinRecovery(accountNumber: string, otp: string): Promise<AuthDto> {
  return apiFetch<AuthDto>("/auth/security-pin/recover/confirm", {
    method: "POST",
    body: JSON.stringify({ account_number: accountNumber, otp }),
  });
}
