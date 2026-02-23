// Cloud Simulation: Homomorphic Multiplication
// Multiplicative property of RSA: E(M1) * E(M2) mod n = E(M1 * M2) mod n

const homomorphicMultiply = (ciphertexts, n) => {
    n = BigInt(n);
    if (!ciphertexts || ciphertexts.length === 0) return { product: 0n, breakdown: "0" };

    let product = 1n;
    let components = [];
    for (let c of ciphertexts) {
        c = BigInt(c);
        components.push(c.toString());
        product = (product * c) % n;
    }

    const breakdown = `(${components.join(" × ")}) mod ${n} = ${product}`;

    return {
        product,
        breakdown
    };
};

module.exports = {
    homomorphicMultiply
};
