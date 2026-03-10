import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_KEY_LENGTH = 64;

function derivePasswordHash(password: string, salt: string) {
  return scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = derivePasswordHash(password, salt);
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedPasswordHash: string | null) {
    console.log(password,'password');
    console.log(storedPasswordHash,'storedPasswordHash');
  if (!storedPasswordHash) {
    return false;
  }

  const [salt, hash] = storedPasswordHash.split(":");
  console.log(salt,hash,'salt,hash');

  // 兼容旧数据：如果历史上直接存了明文密码，允许继续登录。
  if (!salt || !hash) {
    console.log('不是hash');
    
    return storedPasswordHash === password;
  }

  const derivedHash = derivePasswordHash(password, salt);
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derivedHash, "hex"));
}

