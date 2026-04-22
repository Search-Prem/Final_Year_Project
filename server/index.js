const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Fix BigInt serialization globally
if (!BigInt.prototype.toJSON) {
    BigInt.prototype.toJSON = function () { return this.toString(); }
}

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/crypto', require('./routes/cryptoRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Basic route
app.get('/', (req, res) => {
    res.send('Pell-RSA Cloud Security API Running');
});

// Export app for Vercel serverless function
module.exports = app;

// Connect to MongoDB and Start Server (local development only)
if (!process.env.VERCEL) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }).catch(err => {
        console.error("Failed to connect to MongoDB:", err);
    });
}
