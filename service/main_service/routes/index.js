const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/usersController');
const authenticateToken = require('../../../config/middlewares/Middleware');

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user dan dapatkan JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login berhasil
 *       401:
 *         description: Login gagal
 */



// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// User Routes
router.get('/users', authenticateToken, userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

module.exports = router;
