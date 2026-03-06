const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!username || !password) {
            return res.status(400).send({ message: "Username and password are required" });
        }

        // Password strength validation
        const passwordErrors = [];
        if (password.length < 8) passwordErrors.push("at least 8 characters");
        if (!/[A-Z]/.test(password)) passwordErrors.push("one uppercase letter");
        if (!/[a-z]/.test(password)) passwordErrors.push("one lowercase letter");
        if (!/[0-9]/.test(password)) passwordErrors.push("one digit");
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) passwordErrors.push("one special character");

        if (passwordErrors.length > 0) {
            return res.status(400).send({
                message: `Password must contain: ${passwordErrors.join(", ")}`
            });
        }

        // Validate role
        const validRoles = ['Sender', 'Receiver'];
        const userRole = validRoles.includes(role) ? role : 'Sender';

        // Check duplicate
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).send({ message: "Username already exists" });
        }

        const user = new User({
            username,
            passwordHash: await bcrypt.hash(password, 8),
            role: userRole
        });

        await user.save();

        res.send({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }

        const passwordIsValid = await user.comparePassword(password);

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret-key', {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).send({
            id: user._id,
            username: user.username,
            role: user.role,
            accessToken: token
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
