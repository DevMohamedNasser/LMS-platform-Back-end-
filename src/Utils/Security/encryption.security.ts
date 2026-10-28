import crypto, { createDecipheriv } from "node:crypto";
import { env } from "../../Config/config.service";

const IV_LENGTH = 16;
const ENCRYPTION_SECRET_KEY = env.ENCRYPTION_SECRET_KEY;

export const Encrypt = (text: string): string => {
  const iv: Buffer = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECRET_KEY,
    iv,
  );

  let encryptedData = cipher.update(text, "utf-8", "hex");
  encryptedData += cipher.final("hex");

  return `${iv.toString("hex")}:${encryptedData}`;
};

export const Decrypt = (cipher: string): string => {
  const [ivHex, encryptedText] = cipher.split(":");
  if (!ivHex || !encryptedText) throw new Error("Invalid cipher format!!!");

  const binaryLikeIv: Buffer = Buffer.from(ivHex, "hex");

  const decipher = createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECRET_KEY,
    binaryLikeIv,
  );

  let decryptedData: string = decipher.update(encryptedText, "hex", "utf-8");
  decryptedData += decipher.final("utf-8");

  return decryptedData;
};
