const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Cache the connection for serverless environments (Vercel)
let cached = global.mongooseConnection;
if (!cached) {
    cached = global.mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
    // If already connected, reuse connection
    if (cached.conn) {
        return cached.conn;
    }

    // If connection is in progress, wait for it
    if (!cached.promise) {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pell_rsa';
        console.log('MongoDB connecting to:', MONGO_URI.replace(/\/\/.*@/, '//<credentials>@'));

        cached.promise = mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 20000,
            connectTimeoutMS: 20000,
            socketTimeoutMS: 45000,
        }).then((mongoose) => {
            console.log('MongoDB Connected Successfully');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error(`MongoDB Connection Error: ${error.message}`);
        throw error; // Don't process.exit() — let the caller handle it
    }

    return cached.conn;
};

module.exports = connectDB;

