import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as process from 'process';

dotenv.config();

const secretKey = process.env.SECRET_KEY_CRYPTO;
const algorithm = process.env.ALGORITHM_CRYPTO;

export const encryptionData = (dataToEncrypt: string): string | null => {
  try {
    const key = crypto.scryptSync(secretKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encryptedData = cipher.update(dataToEncrypt, 'utf-8', 'hex');
    encryptedData += cipher.final('hex');
    return iv.toString('hex') + encryptedData;
  } catch (e) {
    console.log('e-encrypt', e);
    return null;
  }
};

export const decryptionData = (encryptedData: string): string | null => {
  try {
    const key = crypto.scryptSync(secretKey, 'salt', 32);
    const iv = Buffer.from(encryptedData.slice(0, 32), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decryptedData = decipher.update(
      encryptedData.slice(32),
      'hex',
      'utf-8',
    );
    decryptedData += decipher.final('utf-8');
    return decryptedData;
  } catch (e) {
    console.log('e-decrypt', e);
    return null;
  }
};
