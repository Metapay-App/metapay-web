import bcrypt from "bcryptjs";
import crypto from "crypto";

const API_KEY_PREFIX_TAG = "mp_live";

export interface GeneratedApiKey {
  plainKey: string;
  prefix: string;
  hash: string;
}

export async function generateApiKey(): Promise<GeneratedApiKey> {
  const prefix = crypto.randomBytes(6).toString("hex");
  const secret = crypto.randomBytes(24).toString("hex");
  const plainKey = `${API_KEY_PREFIX_TAG}_${prefix}_${secret}`;
  const hash = await bcrypt.hash(plainKey, 10);

  return { plainKey, prefix, hash };
}

export async function verifyApiKey(
  plainKey: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plainKey, hash);
}

export function extractApiKeyPrefix(plainKey: string): string | null {
  const parts = plainKey.trim().split("_");
  if (parts.length !== 4 || parts[0] !== "mp" || parts[1] !== "live") {
    return null;
  }
  const prefix = parts[2];
  return prefix.length > 0 ? prefix : null;
}
