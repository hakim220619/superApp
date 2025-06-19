const express = require("express");
const authenticateToken = require("../../../config/middlewares/Middleware");

const authController = require("../controllers/authController");
const userController = require("../controllers/usersController");
const menusController = require("../controllers/menusController");
const structureController = require("../controllers/roleStructureController");
const roleAccessController = require("../controllers/roleAccessController");
const roleController = require("../controllers/roleController");
const statusController = require("../controllers/statusController");
const aplikasiController = require("../controllers/aplikasiController");
const tanahController = require("../controllers/tanahController");
const bangunanController = require("../controllers/bangunanController");
const pembandingController = require("../controllers/pembandingController");
const sewaController = require("../controllers/sewaController");
const generalController = require("../controllers/generalController");
const { upload } = require("../../../config/helpers/helpers");

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
router.post(
  "/auth/register/:folderName",
  upload.single("image"),
  authController.register
);

router.post("/auth/login", authController.login);
router.post(
  "/auth/validate-token",
  authenticateToken,
  authController.validateToken
);
router.post("/auth/logout", authenticateToken, authController.logout);

// User Routes
router.get("/users", authenticateToken, userController.getAllUsers);
router.post("/users", authenticateToken, userController.createUsers);
router.get("/users/:id", authenticateToken, userController.getUserById);
router.put(
  "/users/:id/:folderName",
  authenticateToken,
  upload.single("image"),
  userController.updateUser
);
router.delete("/users/:id", authenticateToken, userController.deleteUser);

// User Menus
router.get("/menus", authenticateToken, menusController.getAllMenus);
router.post("/menus", authenticateToken, menusController.createMenu);
router.get("/menus/:id", authenticateToken, menusController.getMenuById);
router.put("/menus/:id", authenticateToken, menusController.updateMenu);
router.delete("/menus/:id", authenticateToken, menusController.deleteMenu);

// Role Structure Routes
router.get(
  "/role_structure_public",
  structureController.getAllRoleStructuresPublic
);
router.get(
  "/role_structure",
  authenticateToken,
  structureController.getAllRoleStructures
);
router.post(
  "/role_structure",
  authenticateToken,
  structureController.createRoleStructure
);
router.get(
  "/role_structure/:id",
  authenticateToken,
  structureController.getRoleStructureById
);
router.put(
  "/role_structure/:id",
  authenticateToken,
  structureController.updateRoleStructure
);
router.delete(
  "/role_structure/:id",
  authenticateToken,
  structureController.deleteRoleStructure
);

// Role Structure Access
router.get(
  "/role_access",
  authenticateToken,
  roleAccessController.getAllRoleAccesses
);
router.post(
  "/role_access",
  authenticateToken,
  roleAccessController.createRoleAccess
);
router.get(
  "/role_access/:id",
  authenticateToken,
  roleAccessController.getRoleAccessById
);
router.put(
  "/role_access/:id",
  authenticateToken,
  roleAccessController.updateRoleAccess
);
router.delete(
  "/role_access/:id",
  authenticateToken,
  roleAccessController.deleteRoleAccess
);

// Role Structure Access
router.get("/role", authenticateToken, roleController.getAllRoles);
router.post("/role", authenticateToken, roleController.createRole);
router.get("/role/:id", authenticateToken, roleController.getRoleById);
router.put("/role/:id", authenticateToken, roleController.updateRole);
router.delete("/role/:id", authenticateToken, roleController.deleteRole);

// Status Access
router.get("/status", authenticateToken, statusController.getAllStatuses);
router.post("/status", authenticateToken, statusController.createStatus);
router.get("/status/:id", authenticateToken, statusController.getStatusById);
router.put("/status/:id", authenticateToken, statusController.updateStatus);
router.delete("/status/:id", authenticateToken, statusController.deleteStatus);

// Aplikasi
router.get("/aplikasi", authenticateToken, aplikasiController.getAllAplikasies);
router.post("/aplikasi", authenticateToken, aplikasiController.createAplikasi);
router.get(
  "/aplikasi/:id",
  authenticateToken,
  aplikasiController.getAplikasiById
);
router.put(
  "/aplikasi/:id/:folderName",
  authenticateToken,
  upload.single("logo"),
  aplikasiController.updateAplikasi
);
router.delete(
  "/aplikasi/:id",
  authenticateToken,
  aplikasiController.deleteAplikasi
);

// Routing untuk resource 'tanah'
router.get("/tanah", authenticateToken, tanahController.getAllTanah);
router.post(
  "/tanah/:folderName",
  authenticateToken,
  upload.single("foto_foto"),
  tanahController.createTanah
);
router.get("/tanah/:id", authenticateToken, tanahController.getTanahById);
router.put(
  "/tanah/:id/:folderName",
  authenticateToken,
  upload.single("foto_foto"),
  tanahController.updateTanah
);
router.delete("/tanah/:id", authenticateToken, tanahController.deleteTanah);

const uploadFields = upload.fields([
  { name: "foto_depan", maxCount: 1 },
  { name: "foto_sisi_kiri", maxCount: 1 },
  { name: "foto_sisi_kanan", maxCount: 1 },
  { name: "foto_lainnya", maxCount: 20 }, // bisa lebih tergantung batas kebutuhan
]);
// Routing untuk resource 'bangunan'
router.get("/bangunan", authenticateToken, bangunanController.getAllBangunan);
router.post(
  "/bangunan/:folderName",
  authenticateToken,
  uploadFields,
  bangunanController.createBangunan
);
router.get(
  "/bangunan/:id",
  authenticateToken,
  bangunanController.getBangunanById
);
router.put(
  "/bangunan/:id/:folderName",
  authenticateToken,
  uploadFields,
  bangunanController.updateBangunan
);
router.delete(
  "/bangunan/:id",
  authenticateToken,
  bangunanController.deleteBangunan
);

router.get(
  "/pembanding",
  authenticateToken,
  pembandingController.getAllPembanding
);
router.post(
  "/pembanding/:folderName",
  authenticateToken,
  uploadFields,
  pembandingController.createPembanding
);
router.get(
  "/pembanding/:id",
  authenticateToken,
  pembandingController.getPembandingById
);
router.put(
  "/pembanding/:id/:folderName",
  authenticateToken,
  uploadFields,
  pembandingController.updatePembanding
);
router.delete(
  "/pembanding/:id",
  authenticateToken,
  pembandingController.deletePembanding
);

// Sewa Access
router.get("/sewa", authenticateToken, sewaController.getAllSewa);
router.post("/sewa", authenticateToken, sewaController.createSewa);
router.get("/sewa/:id", authenticateToken, sewaController.getSewaById);
router.put("/sewa/:id", authenticateToken, sewaController.updateSewa);
router.delete("/sewa/:id", authenticateToken, sewaController.deleteSewa);
router.get(
  "/getInformasiUmum/:id",
  authenticateToken,
  sewaController.getInformasiUmum
);
router.get(
  "/getDataProperti/:id",
  authenticateToken,
  sewaController.getDataProperti
);
router.get(
  "/getDataUnitPerbandingan/:id",
  authenticateToken,
  sewaController.getDataUnitPerbandingan
);
router.get(
  "/findElemenPerbandingan/:sewaId",
  authenticateToken,
  sewaController.findElemenPerbandingan
);

//General
router.get("/getAllObject", authenticateToken, generalController.getAllObject);
router.get(
  "/getAllPembanding",
  authenticateToken,
  generalController.getAllPembanding
);

module.exports = router;
