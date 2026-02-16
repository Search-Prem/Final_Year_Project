const db = require('../models');
const Key = db.Key;
const Message = db.Message;
const rsa = require('../crypto/rsa');
const homomorphic = require('../crypto/homomorphic');
const crt = require('../crypto/crt');

// Generate Keys
exports.generateKeyPair = async (req, res) => {
    try {
        // userId from middleware (need auth middleware)
        const userId = req.userId;
        const { p, q, D } = req.body;

        if (!p || !q || !D) return res.status(400).send({ message: "p, q, D are required" });

        // Generate keys using our crypto engine
        // This might take time for large numbers, so async/await wrap if needed (but it's CPU bound)
        const keys = rsa.generateKeys(p, q, D);

        // Store in DB
        // Save BigInts as strings
        const keyRecord = await Key.create({
            userId: userId,
            p: keys.privateKey.p.toString(),
            q: keys.privateKey.q.toString(),
            D: keys.privateKey.D.toString(),
            n: keys.publicKey.n.toString(),
            e: keys.publicKey.e.toString(),
            d_encrypted: keys.privateKey.d.toString(), // TODO: Encrypt this with user password if real app
            pell_solution_index: keys.metadata.pellSolution.index
        });

        res.send({
            message: "Keys generated successfully",
            publicKey: {
                n: keys.publicKey.n.toString(),
                e: keys.publicKey.e.toString()
            },
            metadata: {
                solutionIndex: keys.metadata.pellSolution.index.toString(),
                pellStep: {
                    x: keys.metadata.pellSolution.x.toString(),
                    y: keys.metadata.pellSolution.y.toString(),
                    index: keys.metadata.pellSolution.index.toString()
                }
            }
        });

    } catch (err) {
        console.error("Key Generation Error:", err);
        console.error("Request Body:", req.body);
        res.status(500).send({ message: "Key Gen Failed: " + err.message });
    }
};

exports.getKeys = async (req, res) => {
    try {
        const userId = req.userId;
        const keys = await Key.findAll({ where: { userId } });
        res.send(keys);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Encrypt
exports.encryptMessage = async (req, res) => {
    try {
        const userId = req.userId;
        const { message, keyId } = req.body;

        const key = await Key.findByPk(keyId);
        if (!key) return res.status(404).send({ message: "Key not found" });

        const publicKey = {
            n: BigInt(key.n),
            e: BigInt(key.e)
        };

        const encrypted = rsa.encrypt(message, publicKey);

        // Store
        // asciiValues is array of BigInt, convert to string for JSON if needed or Number if small (ASCII < 256)
        // ciphertextValues is array of BigInt, must be serialized to string

        const msgRecord = await Message.create({
            userId: userId,
            plaintext: message,
            ascii_values: encrypted.asciiValues.map(x => x.toString()),
            ciphertext_values: encrypted.ciphertextValues.map(x => x.toString()),
            is_verified: false
        });

        res.send({
            message: "Message encrypted",
            ciphertext: encrypted.ciphertextValues.map(x => x.toString())
        });

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Cloud Homomorphic Multiplication
// Input: array of message IDs or ciphertexts
exports.cloudMultiply = async (req, res) => {
    try {
        // This is a "Cloud" route -> It doesn't know the private key.
        // It just receives ciphertexts and public modulus n.
        // For simplicity API, client sends list of ciphertexts and the N to use.

        const { ciphertexts, n } = req.body;

        if (!ciphertexts || !n) return res.status(400).send({ message: "Ciphertexts and n required" });

        const product = homomorphic.homomorphicMultiply(ciphertexts, n);

        res.send({
            result: product.toString()
        });

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Decrypt
exports.decryptMessage = async (req, res) => {
    try {
        const userId = req.userId;
        const { ciphertexts, keyId } = req.body;

        const key = await Key.findByPk(keyId);
        if (!key) return res.status(404).send({ message: "Key not found" });

        // Helper to reconstruct privateKey object
        const privateKey = {
            d: BigInt(key.d_encrypted),
            p: BigInt(key.p),
            q: BigInt(key.q)
        };

        const cipherBigInts = ciphertexts.map(c => BigInt(c));
        const result = crt.decryptCRT(cipherBigInts, privateKey);

        res.send({
            decryptedText: result.decryptedText,
            decryptedCharCodes: result.decryptedCharCodes.map(x => x.toString()),
            decryptionSteps: result.decryptionSteps
        });

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
