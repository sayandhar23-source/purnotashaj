import * as crypto from 'crypto';

// OTPs and referral codes used Math.random(), which is not cryptographically
// secure — its output can be predicted. crypto.randomInt is.
export function secureOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export function secureCode(length = 6, alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'): string {
  let out = '';
  for (let i = 0; i < length; i++) out += alphabet[crypto.randomInt(alphabet.length)];
  return out;
}

// Comparing secrets with === leaks, through timing, how many leading characters matched.
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a || '');
  const bb = Buffer.from(b || '');
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}
