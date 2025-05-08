const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/usersModel');
const response = require('../../../config/helpers/response');

require('dotenv').config();
const SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
    const { username, email } = req.body;

    try {
        const existingUser = await User.findByUsername(username);
        if (existingUser) return response.error(res, 'Username already exists', 400);

        const existingEmail = await User.findByEmail(email);
        if (existingEmail) return response.error(res, 'Email already exists', 400);

        const result = await User.createUser(req.body);
        if (result.success) return response.success(res, 'User registered successfully', result.data, 201);

        return response.error(res, 'Failed to create user', 400);
    } catch (err) {
        return response.error(res, 'Register failed', 500, err.message);
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findBy({ username: username });

        if (!user) return response.error(res, 'User not found', 404);

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return response.error(res, 'Invalid credentials', 401);

        const { id, password: pwd, pin, updated_at, ...safeUser } = user;

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });
        return response.success(res, 'Login successful', {
            token,
            user: safeUser
        });
    } catch (error) {
        return response.error(res, 'Login failed', 500, error.message);
    }
};


module.exports = { register, login };
