// Signed session cookie helpers. Uses Web Crypto (`crypto.subtle`) rather
// than Node's `crypto` module so this same code runs both in Node route
// handlers and in Edge middleware.

export const SESSION_COOKIE_NAME = "timebud_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64url: string): Uint8Array {
  const padded = b64url.padEnd(b64url.length + ((4 - (b64url.length % 4)) % 4), "=");
  const b64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const str = atob(b64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

function requireSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set — see .env.local.example");
  return secret;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS });
  const payloadB64 = toBase64Url(encoder.encode(payload));
  const key = await getHmacKey(requireSecret());
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  const sigB64 = toBase64Url(new Uint8Array(signature));
  return `${payloadB64}.${sigB64}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return false;

  // A malformed/tampered/stale-format cookie value can throw at any step here
  // (bad base64, crypto errors, bad JSON) — all of that just means "not a
  // valid session", so any failure falls through to `return false` rather
  // than crashing the middleware with an uncaught exception.
  try {
    const key = await getHmacKey(requireSecret());
    // Cast the *typed array itself*, not `.buffer` — extracting `.buffer` broke
    // crypto.subtle.verify in the Edge middleware sandbox at runtime (cross-realm
    // ArrayBuffer instanceof check failure), even though it satisfied TypeScript.
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(sigB64) as BufferSource,
      encoder.encode(payloadB64)
    );
    if (!isValid) return false;

    const payload = JSON.parse(decoder.decode(fromBase64Url(payloadB64)));
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
