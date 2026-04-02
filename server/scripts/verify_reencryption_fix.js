const prisma = require('../src/lib/prisma');
const { encrypt, decrypt } = require('../src/utils/crypto');

async function testReEncryption() {
    const rawVal = 'APP_USR-test-token-12345';
    const encrypted = encrypt(rawVal);
    console.log(`Original Encrypted (IV:Hash): ${encrypted}`);

    // Simulate the check logic in the controller
    const isEncrypted = /^[0-9a-f]{32}:[0-9a-f]+$/.test(encrypted);
    console.log(`Is correctly identified as encrypted? ${isEncrypted}`);

    if (isEncrypted) {
        console.log('[OK] Logic would SKIP re-encryption.');
    } else {
        console.log('[FAIL] Logic would TRY to encrypt again!');
    }
    
    // Test double encryption if we forced it (to see if it breaks)
    const doubleEncrypted = encrypt(encrypted);
    try {
        decrypt(doubleEncrypted);
        console.log('Decrypted double: Success (should fail if IV format is strictly enforced)');
    } catch (e) {
        console.log('Decrypted double: FAILED as expected.');
    }
}

testReEncryption();
