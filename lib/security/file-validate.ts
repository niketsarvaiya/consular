/**
 * Validates uploaded files by their magic bytes (file signature), not the
 * client-supplied MIME type (which is trivially spoofable). Prevents someone
 * from uploading an executable/HTML/SVG disguised as "image/jpeg".
 */

const ALLOWED = new Set(["application/pdf", "image/jpeg", "image/png"]);

/** Detect the real type from the first bytes. Returns null if unrecognised. */
export function sniffFileType(buf: Buffer): string | null {
  if (buf.length >= 5 && buf.toString("ascii", 0, 5) === "%PDF-") return "application/pdf";
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) return "image/png";
  return null;
}

/**
 * Throws if the buffer's real content type isn't an allowed document type.
 * Returns the verified MIME type on success.
 */
export function assertAllowedFile(buf: Buffer): string {
  const detected = sniffFileType(buf);
  if (!detected || !ALLOWED.has(detected)) {
    throw new Error("Unsupported or unsafe file. Only genuine PDF, JPEG, or PNG files are accepted.");
  }
  return detected;
}
