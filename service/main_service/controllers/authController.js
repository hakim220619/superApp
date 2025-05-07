const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/usersModel');
const response = require('../../../config/helpers/response');

const SECRET = '283542feuewfd62753r4782398492yehdaskgd267347234823y9geigf';

const register = async (req, res) => {
    const { username } = req.body;

    try {
        const existingUser = await User.findByUsername(username);

        if (existingUser) {
            return response.error(res, 'Username already exists', 400);
        }

        const result = await User.createUser(req.body);

        if (result.success) {
            return response.success(res, 'User registered successfully', result.data, 201);
        }

        return response.error(res, 'Failed to create user', 400);
    } catch (err) {
        return response.error(res, 'Register failed', 500, err.message);
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findByUsername(username);
        if (!user) {
            return response.error(res, 'User not found', 404);
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return response.error(res, 'Invalid credentials', 401);
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });
        return response.success(res, 'Login successful', { token });
    } catch (error) {
        return response.error(res, 'Login failed', 500, error.message);
    }
};

module.exports = { register, login };
