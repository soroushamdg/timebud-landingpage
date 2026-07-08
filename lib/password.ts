import { timingSafeEqual } from "node:crypto";

export function verifyAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD is not set — see .env.local.example");

  const candidateBuf = Buffer.from(candidate);
  const expectedBuf = Buffer.from(expected);

  // Lengths must match before timingSafeEqual (it throws on length mismatch),
  // but comparing lengths first doesn't leak timing info useful to an attacker.
  if (candidateBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(candidateBuf, expectedBuf);
}
