const mongoose = require('mongoose');

const keySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    n: String,
    phi: String,
    fundamentalSolutionX: String,
    fundamentalSolutionY: String,
    d: String,
    e: String,
    p: String,
    q: String,
    D: String,
    iterations: Number,
    iterationLog: [mongoose.Schema.Types.Mixed],
    wienerCheck: mongoose.Schema.Types.Mixed,
    genTime: Number,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // Expire keys after 1 hour (session-like)
    }
});

const Key = mongoose.model('Key', keySchema);
module.exports = Key;
