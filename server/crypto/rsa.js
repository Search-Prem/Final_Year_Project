const { solvePell } = require('./pell');
const { modInverse, modPow, gcd, isPrime, ifourthRoot } = require('./utils');

// Generate Keys
// Inputs: p, q (primes), D (non-square)
const generateKeys = (p, q, D) => {
    p = BigInt(p);
    q = BigInt(q);
    D = BigInt(D);

    if (!isPrime(p)) throw new Error("p is not prime");
    if (!isPrime(q)) throw new Error("q is not prime");

    const n = p * q;
    const phi = (p - 1n) * (q - 1n);

    // Solve Pell for d
    const { d, x, y, solutionIndex, iterationLog } = solvePell(D, phi);

    // Wiener Bound Check: d > (1/3) * N^0.25
    const rootN4 = ifourthRoot(n);
    const threshold = rootN4 / 3n;
    const isWienerSecure = d > threshold;

    // Calculate e
    const e = modInverse(d, phi);

    return {
        publicKey: { n, e },
        privateKey: { d, p, q, D, description: "Pell-RSA" },
        metadata: {
            pellSolution: { x, y, index: solutionIndex, iterationLog },
            wienerCheck: {
                threshold: threshold.toString(),
                d: d.toString(),
                isWienerSecure
            }
        }
    };
};

// Encrypt
// M: string (plaintext)
// publicKey: { n, e }
const encrypt = (message, publicKey) => {
    const { n, e } = publicKey;
    const asciiValues = [];
    const ciphertextValues = [];
    let expandedArithmetic = null;

    for (let i = 0; i < message.length; i++) {
        const charCode = BigInt(message.charCodeAt(i));
        asciiValues.push(charCode);

        // C = M^e mod n
        const c = modPow(charCode, e, n);
        ciphertextValues.push(c);

        // Capture expanded arithmetic for the first character
        if (i === 0) {
            expandedArithmetic = {
                char: message[i],
                charCode: charCode.toString(),
                e: e.toString(),
                n: n.toString(),
                result: c.toString(),
                formula: `${charCode}^${e} mod ${n} = ${c}`
            };
        }
    }

    return {
        asciiValues,
        ciphertextValues,
        expandedArithmetic
    };
};


module.exports = {
    generateKeys,
    encrypt
};
