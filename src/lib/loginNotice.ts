import { LOGIN_NOTICE_KEY } from "../data/constants";

/** Read-and-clear: a notice set by a page that signed a user out on
 * purpose (e.g. right after a password change) should only ever show
 * once, on the very next login screen — not linger for a later, unrelated
 * sign-in in the same tab. Shared by every login screen (customer,
 * corporate, staff). */
export function takeLoginNotice(): string | null {
  try {
    const notice = sessionStorage.getItem(LOGIN_NOTICE_KEY);
    if (notice) sessionStorage.removeItem(LOGIN_NOTICE_KEY);
    return notice;
  } catch {
    return null;
  }
}
