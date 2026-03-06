const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ciphertextValues: [String], // Stored as strings because they are BigInts
    homomorphicResult: {
        type: String // Stored as string (BigInt)
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
