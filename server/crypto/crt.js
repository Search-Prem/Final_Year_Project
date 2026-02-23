const { modPow, modInverse } = require('./utils');

// Decrypt with CRT
// C_array: Array of BigInt ciphertexts
// privateKey: { d, p, q }
const decryptCRT = (cArray, privateKey) => {
    const { d, p, q } = privateKey;

    const dp = d % (p - 1n);
    const dq = d % (q - 1n);
    const qInv = modInverse(q, p);

    let decryptedCharCodes = [];
    let decryptionSteps = [];

    for (let c of cArray) {
        c = BigInt(c);

        const m1 = modPow(c, dp, p);
        const m2 = modPow(c, dq, q);

        let diff = m1 - m2;
        while (diff < 0n) diff += p;

        const h = (qInv * diff) % p;
        const m = m2 + h * q;

        decryptedCharCodes.push(m);

        decryptionSteps.push({
            c: c.toString(),
            dp: dp.toString(),
            dq: dq.toString(),
            q_inv: qInv.toString(),
            m1: m1.toString(),
            m2: m2.toString(),
            h: h.toString(),
            m: m.toString()
        });
    }

    return {
        decryptedCharCodes,
        decryptionSteps
    };
};
module.exports = {
    decryptCRT
};
