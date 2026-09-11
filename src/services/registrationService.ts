import { apiFetch } from "./apiClient";

/** Self-service activation for an account the Compliance Console's "Open
 * Account" tool created — an alternative to clicking the emailed link.
 * Four knowledge factors prove who the customer is; a follow-up emailed
 * OTP steps them up to the real activation token the emailed link itself
 * uses (see confirmRegistrationOtp). */
export interface VerifyIdentityPayload {
  reference: string;
  idNumber: string;
  accountNumber: string;
  secureCode: string;
}

export async function verifyRegistrationIdentity(payload: VerifyIdentityPayload): Promise<void> {
  await apiFetch<null>("/auth/register/verify", {
    method: "POST",
    body: JSON.stringify({
      reference: payload.reference,
      id_number: payload.idNumber,
      account_number: payload.accountNumber,
      secure_code: payload.secureCode,
    }),
  });
}

export interface ConfirmOtpResult {
  email: string;
  token: string;
}

export async function confirmRegistrationOtp(reference: string, otp: string): Promise<ConfirmOtpResult> {
  return apiFetch<ConfirmOtpResult>("/auth/register/confirm-otp", {
    method: "POST",
    body: JSON.stringify({ reference, otp }),
  });
}
