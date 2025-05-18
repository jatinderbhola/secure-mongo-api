import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const generateApiKey = (prefix = 'client') => {
  const suffix = crypto.randomBytes(24).toString('hex');
  return `${prefix}_${suffix}`;
};
export const hashApiKey = async (key) => await bcrypt.hash(key, 10);
export const verifyApiKey = async (key, hash) => await bcrypt.compare(key, hash);
