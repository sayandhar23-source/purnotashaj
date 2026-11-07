// User-supplied search text must never be used as a raw regular expression:
// a crafted pattern can make the database spin (ReDoS) and an invalid one
// throws. This turns it into a plain "contains this text" match.
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
