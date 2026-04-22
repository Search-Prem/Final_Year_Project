const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Fix BigInt serialization globally
if (!BigInt.prototype.toJSON) {
    BigInt.prototype.toJSON = function () { return this.toString(); }
}

// CORS - allow all origins for Vercel deployment
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// Routes - import directly from server directory
app.use('/api/auth', require('../server/routes/authRoutes'));
app.use('/api/crypto', require('../server/routes/cryptoRoutes'));
app.use('/api/reports', require('../server/routes/reportRoutes'));

// Health check
app.get('/api', (req, res) => {
    res.json({
        status: 'Pell-RSA Cloud Security API Running on Vercel',
        dbState: mongoose.connection.readyState
    });
});

// MongoDB connection — cached for serverless
let cached = global.mongooseConnection;
if (!cached) {
    cached = global.mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    if (!cached.promise) {
        const MONGO_URI = process.env.MONGO_URI;
        if (!MONGO_URI) {
            throw new Error('MONGO_URI environment variable is not set!');
        }
        console.log('[Vercel] Connecting to MongoDB...');
        cached.promise = mongoose.connect(MONGO_URI, {
            bufferCommands: false,
        }).then((m) => {
            console.log('[Vercel] MongoDB connected successfully');
            return m;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.promise = null;
        throw err;
    }
    return cached.conn;
};

// Vercel serverless handler
const handler = async (req, res) => {
    try {
        await connectDB();
    } catch (err) {
        console.error('[Vercel] DB connection error:', err.message);
        return res.status(500).json({
            message: 'Database connection failed',
            error: err.message
        });
    }
    return app(req, res);
};

module.exports = handler;
