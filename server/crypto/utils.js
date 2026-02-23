const bigInt = (val) => BigInt(val);

// Greatest Common Divisor
const gcd = (a, b) => {
    a = bigInt(a);
    b = bigInt(b);
    while (b > 0n) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
};

// Extended Euclidean Algorithm
const extendedGCD = (a, b) => {
    a = bigInt(a);
    b = bigInt(b);
    let old_r = a, r = b;
    let old_s = 1n, s = 0n;
    let old_t = 0n, t = 1n;

    while (r !== 0n) {
        let quotient = old_r / r;

        let temp_r = r;
        r = old_r - quotient * r;
        old_r = temp_r;

        let temp_s = s;
        s = old_s - quotient * s;
        old_s = temp_s;

        let temp_t = t;
        t = old_t - quotient * t;
        old_t = temp_t;
    }

    return { gcd: old_r, x: old_s, y: old_t };
};

// Modular Inverse
const modInverse = (a, m) => {
    a = bigInt(a);
    m = bigInt(m);
    const { gcd, x } = extendedGCD(a, m);
    if (gcd !== 1n) {
        throw new Error('Modular inverse does not exist');
    }
    return (x % m + m) % m;
};

// Square and Multiply for Modular Exponentiation
const modPow = (base, exponent, modulus) => {
    base = bigInt(base);
    exponent = bigInt(exponent);
    modulus = bigInt(modulus);

    if (modulus === 1n) return 0n;

    let result = 1n;
    base = base % modulus;

    while (exponent > 0n) {
        if (exponent % 2n === 1n) {
            result = (result * base) % modulus;
        }
        exponent = exponent >> 1n;
        base = (base * base) % modulus;
    }
    return result;
};

// Miller-Rabin Primality Test
const isPrime = (n, k = 5) => {
    n = bigInt(n);
    if (n === 2n || n === 3n) return true;
    if (n < 2n || n % 2n === 0n) return false;

    // Write n-1 as 2^r * d
    let d = n - 1n;
    let r = 0n;
    while (d % 2n === 0n) {
        d /= 2n;
        r += 1n;
    }

    // Witness loop
    for (let i = 0; i < k; i++) {
        // Random base a in [2, n-2]
        // Since we don't use external crypto libs, we simulate random for BigInt
        // In production/stricter checks, use a better RNG. 
        // For this assignment "Do NOT use external cryptography libraries", using Math.random for small range or iterating is acceptable if strictly constrained, 
        // but for BigInt we need to be careful. 
        // We'll construct a random BigInt roughly in range.
        const numBits = n.toString(2).length;
        let a = 0n;
        while (a < 2n || a >= n - 1n) {
            // Generate random bits
            let bits = "";
            for (let b = 0; b < numBits; b++) {
                bits += Math.random() < 0.5 ? "0" : "1";
            }
            a = BigInt("0b" + bits);
        }

        let x = modPow(a, d, n);
        if (x === 1n || x === n - 1n) continue;

        let continueOuter = false;
        for (let j = 0n; j < r - 1n; j++) {
            x = modPow(x, 2n, n);
            if (x === n - 1n) {
                continueOuter = true;
                break;
            }
        }
        if (continueOuter) continue;
        return false;
    }
    return true;
};

const isqrt = (n) => {
    if (n < 0n) throw new Error("negative BigInt sqrt");
    if (n < 2n) return n;
    let x = n;
    let y = (x + 1n) / 2n;
    while (y < x) {
        x = y;
        y = (x + n / x) / 2n;
    }
    return x;
};

const ifourthRoot = (n) => {
    return isqrt(isqrt(n));
};

module.exports = {
    gcd,
    extendedGCD,
    modInverse,
    modPow,
    isPrime,
    isqrt,
    ifourthRoot
};
