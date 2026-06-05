import { extractConversationId } from "./url.js";

export function sanitizeSlugTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[\s._~:/?#\[\]@!$&'()*+,;=]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    .replace(/-$/g, "");

  return slug.length > 0 ? slug : "untitled-conversation";
}

export function shortHash(input: string): string {
  return sha1(input).slice(0, 8);
}

export function createConversationSlug(title: string, url: string): string {
  const safeTitle = sanitizeSlugTitle(title);
  const conversationId = extractConversationId(url) ?? shortHash(url);
  return `${safeTitle}-${conversationId}`;
}

function sha1(input: string): string {
  const bytes = stringToUtf8Bytes(input);
  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) {
    bytes.push(0);
  }

  for (let shift = 56; shift >= 0; shift -= 8) {
    bytes.push((bitLength / 2 ** shift) & 0xff);
  }

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  for (let chunkStart = 0; chunkStart < bytes.length; chunkStart += 64) {
    const words = new Array<number>(80).fill(0);
    for (let index = 0; index < 16; index += 1) {
      const offset = chunkStart + index * 4;
      words[index] =
        (bytes[offset] << 24) |
        (bytes[offset + 1] << 16) |
        (bytes[offset + 2] << 8) |
        bytes[offset + 3];
    }

    for (let index = 16; index < 80; index += 1) {
      words[index] = rotateLeft(words[index - 3] ^ words[index - 8] ^ words[index - 14] ^ words[index - 16], 1);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let index = 0; index < 80; index += 1) {
      const { f, k } = sha1Round(index, b, c, d);
      const temp = (rotateLeft(a, 5) + f + e + k + words[index]) | 0;
      e = d;
      d = c;
      c = rotateLeft(b, 30);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
  }

  return [h0, h1, h2, h3, h4].map(toHexWord).join("");
}

function stringToUtf8Bytes(input: string): number[] {
  const bytes: number[] = [];
  for (let index = 0; index < input.length; index += 1) {
    const codePoint = input.codePointAt(index);
    if (codePoint === undefined) {
      continue;
    }

    if (codePoint > 0xffff) {
      index += 1;
    }

    if (codePoint <= 0x7f) {
      bytes.push(codePoint);
    } else if (codePoint <= 0x7ff) {
      bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint <= 0xffff) {
      bytes.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f));
    } else {
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      );
    }
  }
  return bytes;
}

function sha1Round(index: number, b: number, c: number, d: number): { f: number; k: number } {
  if (index < 20) {
    return { f: (b & c) | (~b & d), k: 0x5a827999 };
  }

  if (index < 40) {
    return { f: b ^ c ^ d, k: 0x6ed9eba1 };
  }

  if (index < 60) {
    return { f: (b & c) | (b & d) | (c & d), k: 0x8f1bbcdc };
  }

  return { f: b ^ c ^ d, k: 0xca62c1d6 };
}

function rotateLeft(value: number, bits: number): number {
  return (value << bits) | (value >>> (32 - bits));
}

function toHexWord(value: number): string {
  return (value >>> 0).toString(16).padStart(8, "0");
}
