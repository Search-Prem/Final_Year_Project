const { solvePell } = require('./pell');
const { modInverse, modPow, gcd, isPrime } = require('./utils');

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
    const { d, x, y, solutionIndex } = solvePell(D, phi);

    // Wiener Bound Check: d > N^0.25
    // N^0.25 is equivalent to N^(1/4). 
    // We can just check d^4 > N to avoid fractional exponents / complex roots on BigInt
    if (d * d * d * d <= n) {
        console.warn("Warning: d is small (Wiener bound), key might be weak.");
        // In strict mode we might reject, but per requirements we just need to "Validate" and "Reject weak keys automatically"
        // Let's throw error if it's strictly required to reject, else just warn.
        // Requirement: "Reject weak keys automatically." -> Throw.
        throw new Error("Weak Key: d failed Wiener bound check (d <= N^0.25)");
    }

    // Calculate e
    const e = modInverse(d, phi);

    return {
        publicKey: { n, e },
        privateKey: { d, p, q, D, description: "Pell-RSA" },
        metadata: {
            pellSolution: { x, y, index: solutionIndex }
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

    for (let i = 0; i < message.length; i++) {
        const charCode = BigInt(message.charCodeAt(i));
        asciiValues.push(charCode);

        // C = M^e mod n
        const c = modPow(charCode, e, n);
        ciphertextValues.push(c);
    }

    return {
        asciiValues,
        ciphertextValues
    };
};


module.exports = {
    generateKeys,
    encrypt
};
