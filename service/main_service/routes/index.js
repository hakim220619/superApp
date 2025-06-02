const express = require('express');
const authenticateToken = require('../../../config/middlewares/Middleware');

const authController = require('../controllers/authController');
const userController = require('../controllers/usersController');
const menusController = require('../controllers/menusController');
const structureController = require('../controllers/roleStructureController');
const roleAccessController = require('../controllers/roleAccessController');
const roleController = require('../controllers/roleController');
const statusController = require('../controllers/statusController');
const aplikasiController = require('../controllers/aplikasiController');
const { upload } = require('../../../config/helpers/helpers');

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
router.post('/auth/register/:folderName', upload.single('image'), authController.register);

router.post('/auth/login', authController.login);
router.post('/auth/validate-token', authenticateToken, authController.validateToken);
router.post('/auth/logout', authenticateToken, authController.logout);

// User Routes
router.get('/users', authenticateToken, userController.getAllUsers);
router.post('/users', authenticateToken, userController.createUsers);
router.get('/users/:id', authenticateToken, userController.getUserById);
router.put('/users/:id/:folderName', authenticateToken, upload.single('image'), userController.updateUser);
router.delete('/users/:id', authenticateToken, userController.deleteUser);

// User Menus
router.get('/menus', authenticateToken, menusController.getAllMenus);
router.post('/menus', authenticateToken, menusController.createMenu);
router.get('/menus/:id', authenticateToken, menusController.getMenuById);
router.put('/menus/:id', authenticateToken, menusController.updateMenu);
router.delete('/menus/:id', authenticateToken, menusController.deleteMenu);

// Role Structure Routes
router.get('/role_structure_public', structureController.getAllRoleStructuresPublic);
router.get('/role_structure', authenticateToken, structureController.getAllRoleStructures);
router.post('/role_structure', authenticateToken, structureController.createRoleStructure);
router.get('/role_structure/:id', authenticateToken, structureController.getRoleStructureById);
router.put('/role_structure/:id', authenticateToken, structureController.updateRoleStructure);
router.delete('/role_structure/:id', authenticateToken, structureController.deleteRoleStructure);

// Role Structure Access
router.get('/role_access', authenticateToken, roleAccessController.getAllRoleAccesses);
router.post('/role_access', authenticateToken, roleAccessController.createRoleAccess);
router.get('/role_access/:id', authenticateToken, roleAccessController.getRoleAccessById);
router.put('/role_access/:id', authenticateToken, roleAccessController.updateRoleAccess);
router.delete('/role_access/:id', authenticateToken, roleAccessController.deleteRoleAccess);

// Role Structure Access
router.get('/role', authenticateToken, roleController.getAllRoles);
router.post('/role', authenticateToken, roleController.createRole);
router.get('/role/:id', authenticateToken, roleController.getRoleById);
router.put('/role/:id', authenticateToken, roleController.updateRole);
router.delete('/role/:id', authenticateToken, roleController.deleteRole);

// Status Access
router.get('/status', authenticateToken, statusController.getAllStatuses);
router.post('/status', authenticateToken, statusController.createStatus);
router.get('/status/:id', authenticateToken, statusController.getStatusById);
router.put('/status/:id', authenticateToken, statusController.updateStatus);
router.delete('/status/:id', authenticateToken, statusController.deleteStatus);

// Aplikasi
router.get('/aplikasi', authenticateToken, aplikasiController.getAllAplikasies);
router.post('/aplikasi', authenticateToken, aplikasiController.createAplikasi);
router.get('/aplikasi/:id', authenticateToken, aplikasiController.getAplikasiById);
router.put('/aplikasi/:id/:folderName', authenticateToken, upload.single('logo'), aplikasiController.updateAplikasi);
router.delete('/aplikasi/:id', authenticateToken, aplikasiController.deleteAplikasi);



module.exports = router;
