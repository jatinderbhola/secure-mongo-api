import bcrypt from 'bcrypt';

export const hashApiKey = async (key) => await bcrypt.hash(key, 10);
export const verifyApiKey = async (key, hash) => await bcrypt.compare(key, hash);
