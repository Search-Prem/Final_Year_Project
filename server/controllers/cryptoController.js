const Key = require('../models/Key');
const Message = require('../models/Message');
const rsa = require('../crypto/rsa');
const homomorphic = require('../crypto/homomorphic');
const crt = require('../crypto/crt');
const { ifourthRoot } = require('../crypto/utils');

/**
 * STEP 1 – KEY GENERATION
 */
exports.generateKeyPair = async (req, res) => {
    try {
        const userId = req.userId;
        const { p, q, D } = req.body;

        if (!p || !q || !D)
            return res.status(400).send({ message: "p, q, D are required" });

        const startTime = Date.now();
        const results = rsa.generateKeys(p, q, D);
        const genTime = Date.now() - startTime;

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

        const startTime = Date.now();
        const encrypted = rsa.encrypt(plaintext, publicKey);
        const encTime = Date.now() - startTime;

        const msgRecord = await Message.create({
            userId,
            plaintext,
            asciiValues: encrypted.asciiValues.map(x => x.toString()),
            ciphertextValues: encrypted.ciphertextValues.map(x => x.toString()),
            expandedArithmetic: encrypted.expandedArithmetic
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

        const startTime = Date.now();
        const { product, breakdown } =
            homomorphic.homomorphicMultiply(msg.ciphertextValues, BigInt(key.n));
        const execTime = Date.now() - startTime;

        msg.homomorphicResult = product.toString();
        msg.cloudBreakdown = breakdown;
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
        const { messageId, keyId } = req.body;

        const msg = await Message.findById(messageId);
        const key = await Key.findById(keyId);

        if (!msg || !key)
            return res.status(404).send({ message: "Record not found" });

        if (!msg.homomorphicResult)
            return res.status(400).send({ message: "Cloud step not executed" });

        const privateKey = {
            d: BigInt(key.d),
            p: BigInt(key.p),
            q: BigInt(key.q)
        };

        const startTime = Date.now();

        const decrypted = crt.decryptCRT(
            [BigInt(msg.homomorphicResult)],
            privateKey
        );

        const decTime = Date.now() - startTime;

        let expected = 1n;
        msg.asciiValues.forEach(v => {
            expected = (expected * BigInt(v)) % BigInt(key.n);
        });

        const decryptedValue = BigInt(decrypted.decryptedCharCodes[0]);
        const isVerified = decryptedValue === expected;

        res.send({
            decryptedResult: decryptedValue.toString(),
            expectedResult: expected.toString(),
            isVerified,
            decryptionSteps: decrypted.decryptionSteps,
            decTime
        });

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};