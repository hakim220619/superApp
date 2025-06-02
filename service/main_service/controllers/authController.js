const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/usersModel');
const response = require('../../../config/helpers/response');
const UserToken = require('../models/authModel');  // Import the user token model


require('dotenv').config();
const SECRET = process.env.JWT_SECRET;
const register = async (req, res) => {
    try {
        const { email } = req.body;

        const existingEmail = await User.findByEmail(email);
        if (existingEmail) return response.error(res, 'Email already exists', 400);

        if (req.file) {
            req.body.image = req.file.path;
        }

        const result = await User.createUser(req.body);

        if (result.success) return response.success(res, 'User registered successfully', result.data, 201);

        return response.error(res, 'Failed to create user', 400);
    } catch (err) {
        return response.error(res, 'Register failed', 500, err.message);
    }
};


const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const dataByEmail = await User.findBy({ email: email });


        const user = dataByEmail.data
        if (!user) return response.error(res, 'User not found', 404);

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return response.error(res, 'Invalid credentials', 401);

        const { password: pwd, pin, updated_at, ...safeUser } = user;

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '12h' })

        const expirationTime = new Date(Date.now() + 9600000); // 1 hour from now
        await UserToken.saveUserToken(user.id, token, expirationTime);

        return response.success(res, 'Login successful', {
            token,
            data: safeUser
        });
    } catch (error) {
        return response.error(res, 'Login failed', 500, error.message);
    }
};


const logout = async (req, res) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.error(res, 'Authorization header missing or malformed', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        // Remove the token from the user_tokens table (optional)
        await UserToken.removeUserToken(token);

        return response.success(res, 'Logout successful', {
            message: 'You have been logged out successfully.'
        });
    } catch (err) {
        console.error('Error during logout:', err.message);
        return response.error(res, 'Logout failed', 500, err.message);
    }
};
const validateToken = async (req, res) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.error(res, 'Authorization header missing or malformed', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return response.error(res, 'Access token missing', 401);
    }

    try {
        const userToken = await UserToken.getUserToken(token);
        if (!userToken) {
            return response.error(res, 'Token is invalid or revoked', 403);
        }

        const now = new Date();
        const expiresAt = new Date(userToken.expires_at);
        if (now > expiresAt) {
            return response.error(res, 'Token has expired', 403);
        }

        jwt.verify(token, SECRET, (err, decoded) => {
            if (err) {
                return response.error(res, 'Invalid or expired token', 403);
            }

            return response.success(res, 'Token is valid', {
                user: decoded,
                expires_at: userToken.expires_at
            });
        });
    } catch (err) {
        return response.error(res, 'Error during token validation', 500, err.message);
    }
};



module.exports = { register, login, logout, validateToken };
