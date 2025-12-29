import crypto from 'crypto';

export function computeHmacSha256(secret: string, payload: Buffer | string) {
  const h = crypto.createHmac('sha256', secret);
  h.update(payload);
  return h.digest('hex');
}

export function verifyHmacHeader(secret: string, payload: Buffer | string, headerValue?: string | string[] | null) {
  if (!headerValue) return false;
  const header = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  // Accept formats like 'sha256=hex' or plain hex
  const maybeSig = header.includes('=') ? header.split('=')[1] : header;
  const computedHex = computeHmacSha256(secret, payload);
  const computedBuf = Buffer.from(computedHex, 'hex');

  // Try to interpret incoming signature as hex first
  try {
    const incomingHex = Buffer.from(maybeSig, 'hex');
    if (incomingHex.length === computedBuf.length && crypto.timingSafeEqual(incomingHex, computedBuf)) return true;
  } catch (e) {
    // not valid hex, continue
  }

  // Try base64
  try {
    const incomingBase64 = Buffer.from(maybeSig, 'base64');
    if (incomingBase64.length === computedBuf.length && crypto.timingSafeEqual(incomingBase64, computedBuf)) return true;
  } catch (e) {
    // not valid base64
  }

  return false;
}

export default { computeHmacSha256, verifyHmacHeader };
