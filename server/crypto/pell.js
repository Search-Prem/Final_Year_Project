const { gcd, isqrt } = require('./utils');

// Solve x^2 - D*y^2 = 1
// Returns the fundamental solution (x, y) or iterates to find a solution where gcd(x, phi) == 1
const solvePell = (D, phi, maxSteps = 1000) => {
    D = BigInt(D);
    phi = BigInt(phi);
    const iterationLog = [];

    // ... existing perfect square checks ...
    const a0 = isqrt(D);
    if (a0 * a0 === D) throw new Error("D is a perfect square");

    let m = 0n;
    let d_val = 1n;
    let a = a0;

    let p_prev = 1n;
    let p_curr = a0;
    let q_prev = 0n;
    let q_curr = 1n;

    while (true) {
        if (p_curr * p_curr - D * q_curr * q_curr === 1n) {
            break;
        }

        m = d_val * a - m;
        d_val = (D - m * m) / d_val;
        a = (a0 + m) / d_val;

        let p_next = a * p_curr + p_prev;
        p_prev = p_curr;
        p_curr = p_next;

        let q_next = a * q_curr + q_prev;
        q_prev = q_curr;
        q_curr = q_next;
    }

    let x1 = p_curr;
    let y1 = q_curr;
    let currentX = x1;
    let currentY = y1;
    let k = 1;

    while (true) {
        const commonGCD = gcd(currentX, phi);
        const status = commonGCD === 1n ? 'SUCCESS' : 'REJECTED';

        iterationLog.push({
            index: k,
            x: currentX.toString(),
            gcd: commonGCD.toString(),
            status
        });

        if (commonGCD === 1n) break;

        k++;
        if (k > maxSteps) {
            throw new Error("Failed to find valid d within max steps");
        }

        let nextX = x1 * currentX + D * y1 * currentY;
        let nextY = x1 * currentY + y1 * currentX;
        currentX = nextX;
        currentY = nextY;
    }

    return {
        d: currentX,
        x: currentX,
        y: currentY,
        solutionIndex: k,
        iterationLog
    };
};

module.exports = { solvePell };
