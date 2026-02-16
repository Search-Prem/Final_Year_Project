const { modPow, modInverse } = require('./utils');

// Decrypt with CRT
// C_array: Array of BigInt ciphertexts
// privateKey: { d, p, q }
const decryptCRT = (cArray, privateKey) => {
    const { d, p, q } = privateKey;
    const n = p * q;
    
    // Precompute CRT params
    const dp = d % (p - 1n);
    const dq = d % (q - 1n);
    const qInv = modInverse(q, p);

    let decryptedCharCodes = [];
    let decryptedText = "";
    let decryptionSteps = [];

    for (let c of cArray) {
        c = BigInt(c);
        
        // m1 = C^dp mod p
        const m1 = modPow(c, dp, p);
        
        // m2 = C^dq mod q
        const m2 = modPow(c, dq, q);
        
        // h = (qInv * (m1 - m2)) % p
        // Handle negative result of (m1 - m2) manually for BigInt modulo
        let diff = m1 - m2;
        while (diff < 0n) diff += p; // ensure positive before modulo
        
        const h = (qInv * diff) % p;
        
        // m = m2 + h*q
        const m = m2 + h * q;
        
        decryptedCharCodes.push(m);
        // Convert back to char
        // Note: m should be within ASCII range if key is valid and no overflow/padding issues
        decryptedText += String.fromCharCode(Number(m));

        decryptionSteps.push({
            c: c.toString(),
            m1: m1.toString(),
            m2: m2.toString(),
            h: h.toString(),
            m: m.toString()
        });
    }

    return {
        decryptedCharCodes,
        decryptedText,
        decryptionSteps
    };
};

module.exports = {
    decryptCRT
};
