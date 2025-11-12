const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const waController = require("../controller/WhatsAppController");

router.post("/start-session", waController.startSession);
router.get("/qr", waController.getQRCode);
router.post("/send-message", waController.sendMessage);
router.get("/check-session/:sessionId", waController.checkSession);
router.post("/reconnect-session", waController.reconnectSession);


module.exports = router;
