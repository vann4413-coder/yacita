import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt);
const SALT_LEN = 16;
const KEY_LEN = 64;

export async function hashPassword(plain: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LEN).toString('hex');
  const key = (await scrypt(plain, salt, KEY_LEN)) as Buffer;
  return `${salt}:${key.toString('hex')}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const key = (await scrypt(plain, salt, KEY_LEN)) as Buffer;
  const storedBuf = Buffer.from(hash, 'hex');
  return crypto.timingSafeEqual(key, storedBuf);
}
