// Cloud Simulation: Homomorphic Multiplication
// Multiplicative property of RSA: E(M1) * E(M2) mod n = E(M1 * M2) mod n

const homomorphicMultiply = (ciphertexts, n) => {
    n = BigInt(n);
    if (!ciphertexts || ciphertexts.length === 0) return 0n;

    let product = 1n;
    for (let c of ciphertexts) {
        c = BigInt(c);
        product = (product * c) % n;
    }

    return product;
};

module.exports = {
    homomorphicMultiply
};
