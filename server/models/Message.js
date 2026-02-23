const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plaintext: {
        type: String,
        required: true
    },
    asciiValues: [Number],
    ciphertextValues: [String], // Stored as strings because they are BigInts
    expandedArithmetic: mongoose.Schema.Types.Mixed,
    homomorphicResult: {
        type: String // Stored as string (BigInt)
    },
    cloudBreakdown: String,
    decryptedResult: {
        type: String // Stored as string (BigInt)
    },
    decryptionSteps: [mongoose.Schema.Types.Mixed],
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
