const Key = require('../models/Key');
const Message = require('../models/Message');
const rsa = require('../crypto/rsa');
const homomorphic = require('../crypto/homomorphic');
const crt = require('../crypto/crt');
const { ifourthRoot } = require('../crypto/utils');
const { performance } = require('perf_hooks');

/**
 * STEP 1 – KEY GENERATION
 */
exports.generateKeyPair = async (req, res) => {
    try {
        const userId = req.userId;
        const { p, q, D } = req.body;

        if (!p || !q || !D)
            return res.status(400).send({ message: "p, q, D are required" });

        const startTime = performance.now();
        const results = rsa.generateKeys(p, q, D);
        const genTime = parseFloat((performance.now() - startTime).toFixed(2));

        const nBig = results.publicKey.n;
        const dBig = results.privateKey.d;

        const phi = (BigInt(p) - 1n) * (BigInt(q) - 1n);

        // ✅ Recompute Wiener Bound Dynamically
        const rootN4 = ifourthRoot(nBig);
        const threshold = rootN4 / 3n;
        const isWienerSecure = dBig > threshold;

        // ✅ Store only essential values
        const keyRecord = await Key.create({
            userId,
            p: p.toString(),
            q: q.toString(),
            D: D.toString(),
            n: nBig.toString(),
            phi: phi.toString(),
            d: dBig.toString(),
            e: results.publicKey.e.toString(),
            fundamentalSolutionX: results.metadata.pellSolution.x.toString(),
            fundamentalSolutionY: results.metadata.pellSolution.y.toString(),
            iterations: results.metadata.pellSolution.index,
            iterationLog: results.metadata.pellSolution.iterationLog,
            genTime
        });

        res.send({
            keyId: keyRecord._id,
            results: {
                n: nBig.toString(),
                e: results.publicKey.e.toString(),
                d: dBig.toString(),
                phi: phi.toString(),
                fundamentalSolution: {
                    x: results.metadata.pellSolution.x.toString(),
                    y: results.metadata.pellSolution.y.toString()
                },
                iterationLog: results.metadata.pellSolution.iterationLog,
                wienerCheck: {
                    threshold: threshold.toString(),
                    d: dBig.toString(),
                    isWienerSecure
                },
                genTime
            }
        });

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

/**
 * FETCH USER KEYS
 */
exports.getKeys = async (req, res) => {
    try {
        const keys = await Key.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.send(keys);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};


/**
 * STEP 2 – ENCRYPTION
 */
exports.encryptMessage = async (req, res) => {
    try {
        const userId = req.userId;
        const { plaintext, keyId } = req.body;

        if (!plaintext || !keyId)
            return res.status(400).send({ message: "plaintext and keyId required" });

        const key = await Key.findById(keyId);
        if (!key)
            return res.status(404).send({ message: "Key not found" });

        const publicKey = {
            n: BigInt(key.n),
            e: BigInt(key.e)
        };

        const startTime = performance.now();
        const encrypted = rsa.encrypt(plaintext, publicKey);
        const encTime = parseFloat((performance.now() - startTime).toFixed(2));

        const msgRecord = await Message.create({
            userId,
            ciphertextValues: encrypted.ciphertextValues.map(x => x.toString())
        });

        res.send({
            messageId: msgRecord._id,
            asciiTable: encrypted.asciiValues.map((val, idx) => ({
                char: plaintext[idx],
                code: val.toString()
            })),
            ciphertext: encrypted.ciphertextValues.map(x => x.toString()),
            expandedArithmetic: encrypted.expandedArithmetic,
            encTime
        });

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};


/**
 * STEP 3 – CLOUD HOMOMORPHIC MULTIPLICATION
 */
exports.cloudMultiply = async (req, res) => {
    try {
        const { messageId, keyId } = req.body;

        const msg = await Message.findById(messageId);
        const key = await Key.findById(keyId);

        if (!msg || !key)
            return res.status(404).send({ message: "Message or Key not found" });

        const startTime = performance.now();
        const { product, breakdown } =
            homomorphic.homomorphicMultiply(msg.ciphertextValues, BigInt(key.n));
        const execTime = parseFloat((performance.now() - startTime).toFixed(2));

        if (product === 0n) {
            return res.status(400).send({
                message: "Homomorphic product is 0. This means one of the ciphertext values is a multiple of n. Please re-encrypt with different input or different primes."
            });
        }

        msg.homomorphicResult = product.toString();
        await msg.save();

        res.send({
            product: product.toString(),
            breakdown,
            cloudExecTime: execTime
        });

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};


/**
 * STEP 4 – DECRYPTION
 */
exports.decryptMessage = async (req, res) => {
    try {
        const { messageId, keyId, privateKey: directKey } = req.body;

        const msg = await Message.findById(messageId);
        if (!msg)
            return res.status(404).send({ message: "Message not found" });

        if (!msg.homomorphicResult)
            return res.status(400).send({ message: "Cloud step not executed" });

        let privateKey;
        let n;

        if (directKey && directKey.d && directKey.p && directKey.q) {
            // Receiver flow: private key provided directly
            privateKey = {
                d: BigInt(directKey.d),
                p: BigInt(directKey.p),
                q: BigInt(directKey.q)
            };
            n = BigInt(directKey.p) * BigInt(directKey.q);
        } else if (keyId) {
            // Sender/testing flow: look up key by ID
            const key = await Key.findById(keyId);
            if (!key)
                return res.status(404).send({ message: "Key not found" });
            privateKey = {
                d: BigInt(key.d),
                p: BigInt(key.p),
                q: BigInt(key.q)
            };
            n = BigInt(key.n);
        } else {
            return res.status(400).send({ message: "Either keyId or privateKey (d, p, q) required" });
        }

        if (msg.homomorphicResult === '0' || BigInt(msg.homomorphicResult) === 0n) {
            return res.status(400).send({
                message: "Cannot decrypt: the homomorphic product is 0. This usually means the original encryption produced a ciphertext that is a multiple of n. Please re-encrypt with different input or primes."
            });
        }

        const startTime = performance.now();

        const decrypted = crt.decryptCRT(
            [BigInt(msg.homomorphicResult)],
            privateKey
        );

        const decryptedValue = BigInt(decrypted.decryptedCharCodes[0]);

        // Decrypt individual ciphertexts back to original text
        const individualDecrypted = crt.decryptCRT(
            msg.ciphertextValues.map(c => BigInt(c)),
            privateKey
        );

        const recoveredChars = individualDecrypted.decryptedCharCodes.map(code => ({
            asciiCode: code.toString(),
            char: String.fromCharCode(Number(code))
        }));

        const recoveredText = recoveredChars.map(c => c.char).join('');

        // Compute expected product from decrypted individual values (no stored plaintext needed)
        let expected = 1n;
        individualDecrypted.decryptedCharCodes.forEach(v => {
            expected = (expected * BigInt(v)) % n;
        });

        const isVerified = decryptedValue === expected;

        const decTime = parseFloat((performance.now() - startTime).toFixed(2));

        res.send({
            decryptedResult: decryptedValue.toString(),
            expectedResult: expected.toString(),
            isVerified,
            decryptionSteps: decrypted.decryptionSteps,
            recoveredText,
            recoveredChars,
            individualDecryptionSteps: individualDecrypted.decryptionSteps,
            decTime
        });

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};