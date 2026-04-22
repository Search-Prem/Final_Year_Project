/**
 * Vercel Serverless Function
 * 
 * We import the pre-configured Express app from server/index.js
 * and connectDB from server/config/db.js so that ALL files
 * (models, controllers, routes) use the SAME mongoose instance.
 */

const connectDB = require('../server/config/db');
const app = require('../server/index');
const mongoose = require('mongoose');

// Debug/health-check route
app.get('/api/health', async (req, res) => {
    const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    const state = mongoose.connection.readyState;

    res.json({
        status: 'API is running',
        database: stateMap[state] || 'unknown',
        dbStateCode: state,
        mongoUri: process.env.MONGO_URI ? 'SET (ends with: ...' + process.env.MONGO_URI.slice(-20) + ')' : 'NOT SET',
        jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
    });
});

// Vercel serverless handler
const handler = async (req, res) => {
    try {
        await connectDB();
    } catch (err) {
        console.error('[Vercel] DB connection error:', err.message);
        return res.status(500).json({
            message: 'Database connection failed',
            error: err.message,
            hint: 'Check: 1) MONGO_URI env var in Vercel, 2) Atlas IP whitelist has 0.0.0.0/0'
        });
    }
    return app(req, res);
};

module.exports = handler;
