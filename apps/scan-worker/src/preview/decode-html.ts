const CHARSET_PATTERN = /charset\s*=\s*"?([^";\s]+)"?/i;
const FALLBACK_CHARSET = "utf-8";

const decoderFor = (contentType: string | null): TextDecoder => {
  const label = contentType?.match(CHARSET_PATTERN)?.[1] ?? FALLBACK_CHARSET;
  try {
    return new TextDecoder(label);
  } catch {
    return new TextDecoder(FALLBACK_CHARSET);
  }
};

export const decodeHtml = (
  bytes: Uint8Array,
  contentType: string | null,
): string => decoderFor(contentType).decode(bytes);
