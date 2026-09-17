import type { ErrorCode } from "@/lib/flash-errors";

export const MIN_PASSWORD_LENGTH = 10;

const LETTER = /[\p{L}]/u;
const DIGIT = /\d/;

export function validatePassword(
  password: string
): Extract<ErrorCode, "password_short" | "password_weak"> | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return "password_short";
  }
  if (!LETTER.test(password) || !DIGIT.test(password)) {
    return "password_weak";
  }
  return null;
}
