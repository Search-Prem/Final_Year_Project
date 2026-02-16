const db = require('../models');
const User = db.User;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send({ message: "Username and password are required" });
        }

        // Check duplicate
        const existing = await User.findOne({ where: { username } });
        if (existing) {
            return res.status(400).send({ message: "Username already exists" });
        }

        const password_hash = await bcrypt.hash(password, 8);

        await User.create({
            username,
            password_hash
        });

        res.send({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }

        const passwordIsValid = await bcrypt.compare(password, user.password_hash);

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret-key', {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).send({
            id: user.id,
            username: user.username,
            role: user.role,
            accessToken: token
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
