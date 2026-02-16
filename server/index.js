const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./models');

dotenv.config();

const app = express();

// Fix BigInt serialization globally
BigInt.prototype.toJSON = function () { return this.toString(); }

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/crypto', require('./routes/cryptoRoutes'));

// Basic route
app.get('/', (req, res) => {
    res.send('Pell-RSA Cloud Security API Running');
});

// Sync Database and Start Server
// In production, use migrations. For this assignment, sync({ force: false }) or alter: true is fine.
db.sequelize.sync({ alter: true }).then(() => {
    console.log("Database connected and synced.");
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error("Failed to sync database:", err);
});
