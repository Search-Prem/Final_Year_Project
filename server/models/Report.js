const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        role: {
            type: String,
            enum: ['Sender', 'Receiver'],
            required: true
        },
        // Sender timing data
        genTime: {
            type: Number,
            default: null
        },
        encTime: {
            type: Number,
            default: null
        },
        cloudExecTime: {
            type: Number,
            default: null
        },
        // Receiver timing data
        decPhase1Time: {
            type: Number,
            default: null
        },
        decPhase2Time: {
            type: Number,
            default: null
        },
        decTime: {
            type: Number,
            default: null
        },
        // Additional metadata
        timestamp: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    { timestamps: true }
);

// Index for efficient queries by userId and timestamp
reportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
