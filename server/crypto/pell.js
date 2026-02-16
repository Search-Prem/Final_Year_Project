const { gcd } = require('./utils');

// Solve x^2 - D*y^2 = 1
// Returns the fundamental solution (x, y) or iterates to find a solution where gcd(x, phi) == 1
const solvePell = (D, phi, maxSteps = 1000) => {
    D = BigInt(D);
    phi = BigInt(phi);

    // 1. Check if D is a perfect square
    const sqrtD = BigInt(Math.floor(Math.sqrt(Number(D)))); // Approximation for check
    if (sqrtD * sqrtD === D) {
        throw new Error("D must be a non-square integer");
    }

    // 2. Continuous Fraction Expansion to find fundamental solution
    // sqrt(D) approx
    let m = 0n;
    let d = 1n;
    let a = BigInt(Math.floor(Math.sqrt(Number(D))));

    // Check again for perfect square with BigInt precision if Number() wasn't enough (though Number is safe for safe integer range, D might be large)
    // Actually for BigInt sqrt, simpler to just loop or use Newton's if needed, 
    // but for this specific "Pell" task, usually inputs D are small-ish integers (like 2, 3, 5...) or we need a proper ISqrt.
    // Let's implement a simple integer sqrt for BigInt to be safe.
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

    let a0 = isqrt(D);
    if (a0 * a0 === D) throw new Error("D is a perfect square");

    m = 0n;
    d = 1n;
    a = a0;

    let num1 = 1n, num2 = a;
    let den1 = 0n, den2 = 1n;

    // Fundamental solution search
    // We look for x^2 - D*y^2 = 1
    // The convergents of sqrt(D) give solutions.

    let x = a0;
    let y = 1n; // Initial guess might not be right immediately unless D is special, but std algorithm:

    // Standard Continued Fraction Algorithm for Pell's Equation
    // p_n / q_n are convergents. 
    // p_{-1}=1, p_0=a0
    // q_{-1}=0, q_0=1

    let p_prev = 1n;
    let p_curr = a0;
    let q_prev = 0n;
    let q_curr = 1n;

    while (true) {
        // Check if (p_curr, q_curr) is a solution
        if (p_curr * p_curr - D * q_curr * q_curr === 1n) {
            x = p_curr;
            y = q_curr;
            break;
        }

        m = d * a - m;
        d = (D - m * m) / d;
        a = (a0 + m) / d;

        let p_next = a * p_curr + p_prev;
        p_prev = p_curr;
        p_curr = p_next;

        let q_next = a * q_curr + q_prev;
        q_prev = q_curr;
        q_curr = q_next;
    }

    // Now we have fundamental solution (x1, y1) = (x, y)
    let x1 = x;
    let y1 = y;

    // We need d (which is x) such that gcd(x, phi) == 1
    // If gcd(x, phi) != 1, we generate next solutions
    // x_k+1 = x1*x_k + D*y1*y_k
    // y_k+1 = x1*y_k + y1*x_k

    let currentX = x1;
    let currentY = y1;
    let k = 1; // Solution index

    while (gcd(currentX, phi) !== 1n) {
        k++;
        if (k > maxSteps) {
            throw new Error("Failed to find valid d within max steps");
        }

        // Recurrence
        let nextX = x1 * currentX + D * y1 * currentY;
        let nextY = x1 * currentY + y1 * currentX;

        currentX = nextX;
        currentY = nextY;
    }

    return {
        d: currentX, // The chosen private exponent
        x: currentX,
        y: currentY,
        solutionIndex: k
    };
};

module.exports = { solvePell };
