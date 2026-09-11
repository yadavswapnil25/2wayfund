import { apiFetch } from "./apiClient";

/** The 9-Digit PIN & Security page's two OTP-gated changes: the
 * transaction PIN, and the NetBanking sign-in password. Both are
 * two-step, like self-service registration — the current password or
 * 8-digit secure code proves who's asking, then an emailed one-time
 * code confirms the change before it actually applies. */

export async function initiatePinChange(
  payload: { currentCredential: string; newPin: string; newPinConfirmation: string },
  token: string
): Promise<void> {
  await apiFetch<null>("/me/pin/initiate", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      current_credential: payload.currentCredential,
      new_pin: payload.newPin,
      new_pin_confirmation: payload.newPinConfirmation,
    }),
  });
}

export async function confirmPinChange(otp: string, token: string): Promise<void> {
  await apiFetch<null>("/me/pin/confirm", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ otp }),
  });
}

export async function initiatePasswordChange(
  payload: { currentCredential: string; newPassword: string; newPasswordConfirmation: string },
  token: string
): Promise<void> {
  await apiFetch<null>("/me/password/initiate", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      current_credential: payload.currentCredential,
      new_password: payload.newPassword,
      new_password_confirmation: payload.newPasswordConfirmation,
    }),
  });
}

export async function confirmPasswordChange(otp: string, token: string): Promise<void> {
  await apiFetch<null>("/me/password/confirm", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ otp }),
  });
}
