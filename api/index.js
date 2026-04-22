const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

// Also try root .env
dotenv.config();

const connectDB = require('../server/config/db');

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

// Routes
app.use('/api/auth', require('../server/routes/authRoutes'));
app.use('/api/crypto', require('../server/routes/cryptoRoutes'));
app.use('/api/reports', require('../server/routes/reportRoutes'));

// Health check
app.get('/api', (req, res) => {
    res.json({ status: 'Pell-RSA Cloud Security API Running on Vercel' });
});

// Connect to MongoDB on cold start
let isConnected = false;

const connectOnce = async () => {
    if (!isConnected) {
        await connectDB();
        isConnected = true;
    }
};

// Wrap with DB connection
const handler = async (req, res) => {
    await connectOnce();
    return app(req, res);
};

module.exports = handler;
