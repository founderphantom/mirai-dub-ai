/**
 * Generate and validate signed download tokens
 * Allows temporary authenticated access to download endpoints
 */

/**
 * Convert standard base64 to URL-safe base64
 * Replaces + with -, / with _, and removes padding
 */
function toUrlSafeBase64(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Convert URL-safe base64 back to standard base64
 * Replaces - with +, _ with /, and adds padding
 */
function fromUrlSafeBase64(urlSafe: string): string {
  let base64 = urlSafe.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }
  return base64;
}

/**
 * Generate a signed download token
 * @param videoId - The video ID to download
 * @param userId - The user who owns the video
 * @param secret - Secret key for signing
 * @param expiresIn - Token expiration in seconds (default: 7 days)
 * @returns Object with token and expiration timestamp
 */
export async function generateDownloadToken(
  videoId: string,
  userId: string,
  secret: string,
  expiresIn: number = 604800 // 7 days default
): Promise<{ token: string; expiresAt: string }> {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  // Create payload
  const payload = {
    videoId,
    userId,
    exp: Math.floor(expiresAt.getTime() / 1000),
  };

  // Encode payload as URL-safe base64
  const payloadJson = JSON.stringify(payload);
  const payloadBase64 = toUrlSafeBase64(btoa(payloadJson));

  // Create signature using Web Crypto API
  // Sign the URL-safe payload (what will be in the token)
  const encoder = new TextEncoder();
  const data = encoder.encode(payloadBase64);
  const keyData = encoder.encode(secret);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);
  const signatureBase64 = toUrlSafeBase64(btoa(String.fromCharCode(...new Uint8Array(signature))));

  // Combine payload and signature (both URL-safe)
  const token = `${payloadBase64}.${signatureBase64}`;

  return {
    token,
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Validate a signed download token
 * @param token - The token to validate
 * @param secret - Secret key for verification
 * @returns Decoded payload if valid, null if invalid or expired
 */
export async function validateDownloadToken(
  token: string,
  secret: string
): Promise<{ videoId: string; userId: string } | null> {
  try {
    const [payloadBase64, signatureBase64] = token.split(".");

    if (!payloadBase64 || !signatureBase64) {
      return null;
    }

    // Verify signature using URL-safe payload (same as what was signed)
    const encoder = new TextEncoder();
    const data = encoder.encode(payloadBase64);
    const keyData = encoder.encode(secret);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Convert URL-safe base64 back to standard for atob()
    const signatureBytes = Uint8Array.from(
      atob(fromUrlSafeBase64(signatureBase64)),
      (c) => c.charCodeAt(0)
    );
    const isValid = await crypto.subtle.verify("HMAC", cryptoKey, signatureBytes, data);

    if (!isValid) {
      return null;
    }

    // Decode payload (convert URL-safe base64 back to standard for atob())
    const payloadJson = atob(fromUrlSafeBase64(payloadBase64));
    const payload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    return {
      videoId: payload.videoId,
      userId: payload.userId,
    };
  } catch (error) {
    console.error("Token validation error:", error);
    return null;
  }
}
