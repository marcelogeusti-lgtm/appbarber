const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
// IMPORTANT: ENCRYPTION_KEY must be a 32-byte hex string (64 chars) in .env
// If not found, we use a fallback to avoid losing access on every restart, 
// but we warn the user to set a proper one for production.
const FALLBACK_KEY = Buffer.from('884c987622c7a6acc2705cc710d0f50762bd13ec26c697a224a1811e56a644da', 'hex');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
    ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
    : FALLBACK_KEY;

if (!process.env.ENCRYPTION_KEY) {
    console.warn('⚠️ [Crypto] ENCRYPTION_KEY not set in .env! Using fallback key. DO NOT USE IN PRODUCTION.');
}

const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
    if (!text) return null;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    if (!text) return null;
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('[Crypto] Decryption failed:', error.message);
        return null;
    }
}

module.exports = { encrypt, decrypt };
