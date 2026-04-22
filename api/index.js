/**
 * Vercel Serverless Function
 * 
 * Imports the pre-configured Express app from server/index.js
 * and connectDB from server/config/db.js so that ALL files
 * (models, controllers, routes) use the SAME mongoose instance.
 */

const connectDB = require('../server/config/db');
const app = require('../server/index');

// Debug/health-check route — does an actual DB ping
app.get('/api/health', async (req, res) => {
    try {
        // Use the same mongoose that server uses (not a separate import)
        const mongoose = require('mongoose');
        let serverMongoose;
        try {
            serverMongoose = require('../server/node_modules/mongoose');
        } catch (e) {
            serverMongoose = mongoose;
        }
        
        const rootState = mongoose.connection.readyState;
        const serverState = serverMongoose.connection.readyState;
        const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

        // Try an actual database ping
        let pingResult = 'not attempted';
        try {
            await connectDB();
            const activeMongoose = serverMongoose.connection.readyState === 1 ? serverMongoose : mongoose;
            if (activeMongoose.connection.db) {
                await activeMongoose.connection.db.admin().ping();
                pingResult = 'SUCCESS';
            } else {
                pingResult = 'no db object available';
            }
        } catch (pingErr) {
            pingResult = 'FAILED: ' + pingErr.message;
        }

        res.json({
            status: 'API is running',
            rootMongoose: stateMap[rootState] || 'unknown',
            serverMongoose: stateMap[serverState] || 'unknown',
            dbPing: pingResult,
            mongoUri: process.env.MONGO_URI ? 'SET (ends with: ...' + process.env.MONGO_URI.slice(-20) + ')' : 'NOT SET',
            jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
            nodeVersion: process.version,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({ status: 'ERROR', error: err.message, stack: err.stack });
    }
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
