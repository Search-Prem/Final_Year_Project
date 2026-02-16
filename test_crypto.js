const { generateKeys, encrypt } = require('./server/crypto/rsa');
const { decryptCRT } = require('./server/crypto/crt');
const { homomorphicMultiply } = require('./server/crypto/homomorphic');
const { solvePell } = require('./server/crypto/pell');

const runTests = () => {
    console.log("Running Crypto Engine Tests...\n");

    let passed = 0;
    let failed = 0;

    const assert = (condition, message) => {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            failed++;
        }
    };

    try {
        // Test 1: Pell Equation Solver
        console.log("--- Test 1: Pell Solver (D=2) ---");
        // x^2 - 2y^2 = 1. Fundamental sol: x=3, y=2. 3^2 - 2*2^2 = 9-8=1.
        // We'll pass a dummy phi to ensure it just returns fundamental if valid
        const pellRes = solvePell(2, 65537n);
        assert(pellRes.x === 3n && pellRes.y === 2n, `Fundamental solution for D=2 should be (3, 2). Got (${pellRes.x}, ${pellRes.y})`);

        // Test 2: Requirement Case 1
        // p=61, q=53, D=2. 
        // 10 * 5 = 50.
        console.log("\n--- Test 2: Req Case 1 (p=61, q=53, D=2) ---");
        const p = 61n;
        const q = 53n;
        const D = 2; // D=2
        const keys = generateKeys(p, q, D);
        console.log("Generated Keys:", { n: keys.publicKey.n, e: keys.publicKey.e, d: keys.privateKey.d });

        // Encrypt 10 and 5 (as raw values, simulating ASCII logic but raw numbers for math check)
        // System usually encrypts ASCII, but let's test the math directly.
        // C1 = 10^e mod n
        const n = keys.publicKey.n;
        const e = keys.publicKey.e;

        const bigInt = BigInt;
        // Need modPow from utils but it's internal. We can use BigInt exponentiation for test script if safe
        // Or require utils
        const { modPow } = require('./server/crypto/utils');

        const val1 = 10n;
        const val2 = 5n;

        const c1 = modPow(val1, e, n);
        const c2 = modPow(val2, e, n);

        // Homomorphic Multiply
        const cProduct = homomorphicMultiply([c1, c2], n);

        // Decrypt Product
        const decryptedRes = decryptCRT([cProduct], keys.privateKey);
        // decryptedRes.decryptedCharCodes[0] gives the number
        const resultVal = decryptedRes.decryptedCharCodes[0];

        assert(resultVal === 50n, `10 * 5 should decrypt to 50. Got ${resultVal}`);


        // Test 3: Standard Encrypt/Decrypt
        console.log("\n--- Test 3: String Encrypt/Decrypt ---");
        const msg = "Hello Pell";
        const enc = encrypt(msg, keys.publicKey);
        const dec = decryptCRT(enc.ciphertextValues, keys.privateKey);
        assert(dec.decryptedText === msg, `Decrypt text matches original. Got '${dec.decryptedText}'`);


        // Test 4: Invalid d check (skipped automatically) / D non-square
        // Req Case 3: p=11, q=13, D=2. 
        // p*q = 143. phi = 10*12=120.
        // Pell D=2 -> x=3, y=2. d=3. 
        // gcd(d, phi) = gcd(3, 120) = 3 != 1.
        // Solver should increment.
        // Next sol: x = 3*3 + 2*2*2 = 9 + 8 = 17.
        // gcd(17, 120) = 1. Valid.
        // So d should be 17.
        console.log("\n--- Test 4: Req Case 3 (p=11, q=13, D=2) - Automatic Skip ---");
        try {
            const keysSmall = generateKeys(11, 13, 2);
            // NOTE: Wiener bound check might fail here because n is tiny (143). 143^0.25 ~ 3.4. 
            // d=17 > 3.4. So check passes.
            assert(keysSmall.privateKey.d === 17n, `Should skip d=3 and find d=17. Got ${keysSmall.privateKey.d}`);
        } catch (err) {
            console.log("Error in Test 4 (might be Wiener or other):", err.message);
            // It might fail on Wiener check if implemented strictly >= vs >. 
            // d=17, n=143. 17^4 = 83521 > 143. Pass.
            if (err.message.includes("Wiener")) assert(false, "Wiener check failed unexpectedly");
            else assert(false, `Unexpected error: ${err.message}`);
        }

    } catch (e) {
        console.error("Critical Test Failure:", e);
        failed++;
    }

    console.log(`\nTests Completed. Pass: ${passed}, Fail: ${failed}`);
};

runTests();
