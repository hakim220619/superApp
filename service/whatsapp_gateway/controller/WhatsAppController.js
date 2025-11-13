const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const cors = require("cors");
const puppeteer = require("puppeteer");
const multer = require("multer");
const WhatsAppModel = require("../model/WhatsAppModel");

const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode");


let clients = {};

function generateRandomString(length = 30) {
    return crypto.randomBytes(length).toString("hex").slice(0, length);
}

const puppeteerOptions = {
    headless: true,
    args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
        "--no-zygote",
        "--disable-gpu",
    ],
};

async function initializeClient(sessionId, sessionPath) {
    return new Promise((resolve, reject) => {
        const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

        // ✅ Cegah crash saat tutup browser lama
        (async () => {
            if (clients[sessionId] && clients[sessionId].pupBrowser) {
                console.log("⚙️ Closing existing Puppeteer browser for", sessionId);
                try {
                    await clients[sessionId].pupBrowser.close();
                } catch (err) {
                    console.log("⚠️ Failed to close old browser:", err.message);
                }
            }

            // ✅ Inisialisasi client baru
            const client = new Client({
                authStrategy: new LocalAuth({ clientId: sessionId, dataPath: sessionPath }),
                puppeteer: {
                    headless: true,
                    executablePath: chromePath,
                    args: [
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-dev-shm-usage",
                        "--disable-accelerated-2d-canvas",
                        "--no-first-run",
                        "--no-zygote",
                        "--disable-gpu",
                        "--window-size=1920x1080",
                    ],
                },
            });

            // ✅ QR Event
            client.on("qr", async (qr) => {
                try {
                    console.log(`📱 QR generated for session ${sessionId}`);
                    const qrBase64 = await qrcode.toDataURL(qr);
                    resolve({ qr: qrBase64, status: "qr" });
                } catch (err) {
                    reject(err);
                }
            });

            // ✅ Ready Event
            client.on("ready", () => {
                console.log(`✅ Client ${sessionId} ready`);
                resolve({ status: "ready" });
            });

            // ✅ Authenticated Event
            client.on("authenticated", () => {
                console.log(`🔐 Client ${sessionId} authenticated`);
            });

            // ✅ Auth Failure Event
            client.on("auth_failure", (msg) => {
                console.error(`❌ Auth failure for ${sessionId}:`, msg);
                reject(new Error(`Auth failed: ${msg}`));
            });

            // ✅ Disconnected Event
            client.on("disconnected", (reason) => {
                console.log(`⚠️ Client ${sessionId} disconnected:`, reason);
                try {
                    client.destroy();
                } catch (err) {
                    console.error("Destroy failed:", err.message);
                }
                delete clients[sessionId];
            });

            // ✅ Error Handler untuk Puppeteer
            client.on("error", (err) => {
                console.error(`💥 Puppeteer error on ${sessionId}:`, err.message);
                reject(err);
            });

            client.on('message_ack', (msg, ack) => {
                /*
                    ACK Values:
                    0 = Message created
                    1 = Message sent to server
                    2 = Message delivered to recipient
                    3 = Message read by recipient
                    -1 = Message failed to send
                */
                console.log(`ACK for ${msg.id.id}:`, ack);
            });


            try {
                await client.initialize();
                clients[sessionId] = client;
            } catch (err) {
                console.error(`🚨 Failed to initialize client ${sessionId}:`, err.message);
                reject(err);
            }
        })();
    });
}

async function initWhatsApp(req, res) {
    try {
        const sessionId = req.body.session_id || generateRandomString(10);
        const sessionPath = path.join(__dirname, "..", "sessions", sessionId);
        const result = await initializeClient(sessionId, sessionPath);
        res.status(200).json({ sessionId, ...result });
    } catch (error) {
        console.error("Init WhatsApp Error:", error);
        res.status(500).json({ error: error.message });
    }
}

async function getQRCode(req, res) {
    try {
        const sessionId = req.body.session_id || generateRandomString(10);
        const sessionPath = path.join(__dirname, "..", "sessions", sessionId);
        const result = await initializeClient(sessionId, sessionPath);
        res.status(200).json({ sessionId, ...result });
    } catch (error) {
        console.error("Get QR Error:", error);
        res.status(500).json({ error: error.message });
    }
}

async function startSession(req, res) {
    try {
        const { sessionName } = req.body;
        if (!sessionName) {
            return res.status(400).json({
                status: false,
                message: "Session name is required.",
            });
        }

        const sessionId = generateRandomString();
        const sessionFolder = `${sessionName}_${sessionId}`;
        const baseAuthPath = path.join(__dirname, ".wwebjs_auth");

        // 🔹 Auto create base directory jika belum ada
        if (!fs.existsSync(baseAuthPath)) {
            fs.mkdirSync(baseAuthPath, { recursive: true });
            console.log(`Created base auth directory: ${baseAuthPath}`);
        }

        const sessionPath = path.join(baseAuthPath, sessionFolder);

        // 🔹 Cek apakah ada session lama untuk nama ini
        const existingSession = fs
            .readdirSync(baseAuthPath, { withFileTypes: true })
            .find(dir => dir.isDirectory() && dir.name.startsWith(sessionName + "_"));

        if (existingSession) {
            const existingSessionPath = path.join(baseAuthPath, existingSession.name);
            console.log(`Session ${sessionName} already exists at: ${existingSessionPath}`);

            const existingClient = clients[existingSession.name];

            // Jika client sudah aktif
            if (existingClient && existingClient.info && existingClient.info.wid) {
                return res.json({
                    status: true,
                    sessionId: existingSession.name,
                    sessionName,
                    message: "Session already connected.",
                    connected: true,
                });
            }

            // Jika client belum aktif → tampilkan QR
            console.log(`Reinitializing existing session for ${sessionName}`);
            const qrCode = await initializeClient(existingSession.name, existingSessionPath);

            return res.json({
                status: true,
                sessionId: existingSession.name,
                sessionName,
                qr: qrCode.qr,
                connected: false,
            });
        }

        // 🔹 Jika belum ada session → buat baru
        fs.mkdirSync(sessionPath, { recursive: true });
        console.log(`Initializing new session: ${sessionName} with ID: ${sessionId}`);

        const qrCode = await initializeClient(sessionId, sessionPath);
        res.json({
            status: true,
            sessionId,
            sessionName,
            qr: qrCode.qr,
            connected: false,
        });

    } catch (error) {
        console.error("Error creating session:", error);
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
}

async function checkSession(req, res) {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({
                status: false,
                message: "Session ID is required.",
            });
        }

        const client = clients[sessionId];

        // 🔹 Jika client belum ada di memory
        if (!client) {
            const baseAuthPath = path.join(__dirname, ".wwebjs_auth");
            const sessionPath = path.join(baseAuthPath, sessionId);

            if (!fs.existsSync(sessionPath)) {
                return res.status(404).json({
                    status: false,
                    message: `Session "${sessionId}" not found.`,
                    connected: false,
                });
            }

            return res.status(200).json({
                status: true,
                message: `Session "${sessionId}" exists but not connected.`,
                connected: false,
            });
        }

        // 🔹 Jika client sedang aktif
        if (client.info && client.info.wid) {
            return res.status(200).json({
                status: true,
                message: `Session "${sessionId}" is connected.`,
                connected: true,
                user: {
                    id: client.info.wid._serialized,
                    name: client.info.pushname || "Unknown",
                },
            });
        }

        // 🔹 Jika client belum terhubung
        return res.status(200).json({
            status: true,
            message: `Session "${sessionId}" exists but not connected.`,
            connected: false,
        });
    } catch (error) {
        console.error("Check session error:", error);
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
}

const sessionLocks = {};

async function reconnectSession(req, res) {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                status: false,
                message: "Session ID is required.",
            });
        }

        const baseAuthPath = path.join(__dirname, ".wwebjs_auth");
        const sessionPath = path.join(baseAuthPath, sessionId);

        // ✅ Auto-create folder jika belum ada
        if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
        }

        // ✅ Cegah reconnect ganda
        if (sessionLocks[sessionId]) {
            return res.status(429).json({
                status: false,
                message: `Session "${sessionId}" is already reconnecting.`,
            });
        }

        sessionLocks[sessionId] = true;

        const existingClient = clients[sessionId];
        if (existingClient && existingClient.info && existingClient.info.wid) {
            delete sessionLocks[sessionId];
            return res.status(200).json({
                status: true,
                message: `Session "${sessionId}" is already connected.`,
                connected: true,
                user: {
                    id: existingClient.info.wid._serialized,
                    name: existingClient.info.pushname || "Unknown",
                },
            });
        }

        console.log(`Reconnecting session: ${sessionId}`);

        try {
            // ✅ Hapus file lock Chrome jika tertinggal
            const lockFile = path.join(sessionPath, "session", "SingletonLock");
            if (fs.existsSync(lockFile)) {
                console.log("⚠️ Detected leftover Chrome lock file, deleting...");
                fs.unlinkSync(lockFile);
            }

            // 🔹 Jalankan reinit client
            const qrCode = await initializeClient(sessionId, sessionPath);

            delete sessionLocks[sessionId];

            if (qrCode?.qr) {
                return res.status(200).json({
                    status: true,
                    message: `QR Code generated for session "${sessionId}".`,
                    connected: false,
                    qr: qrCode.qr,
                });
            }

            return res.status(200).json({
                status: true,
                message: `Session "${sessionId}" reinitialized successfully.`,
                connected: false,
            });

        } catch (err) {
            delete sessionLocks[sessionId];
            console.error(`⚠️ Puppeteer error for ${sessionId}:`, err.message);

            // ✅ Jangan biarkan Node crash
            return res.status(500).json({
                status: false,
                message: `Failed to launch browser: ${err.message}`,
            });
        }

    } catch (error) {
        delete sessionLocks[req.body?.sessionId];
        console.error("Reconnect session error:", error);
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
}


async function sendMessage(req, res) {
    try {
        const { session_id, number, message } = req.body;
        const client = clients[session_id];

        if (!client) {
            // Simpan ke DB sebagai gagal karena client tidak ditemukan
            await WhatsAppModel.createMessageLog({
                session_id,
                number,
                message,
                status: "FAILED",
                error_message: "Client not initialized or not found",
            });

            return res.status(400).json({
                success: false,
                message: "Client not initialized or not found",
            });
        }

        const chatId = `${number}@c.us`;

        // Kirim pesan
        const msg = await client.sendMessage(chatId, message);

        // Jika berhasil dikirim ke device lokal
        if (msg && msg.id && msg.body) {
            // Simpan ke DB
            await WhatsAppModel.createMessageLog({
                session_id,
                number,
                message,
                status: "SENT",
                msg_id: msg.id.id,
                timestamp: msg.timestamp,
                from_me: msg.fromMe,
            });

            return res.status(200).json({
                success: true,
                message: "Message sent successfully",
                data: {
                    to: number,
                    msgId: msg.id.id,
                    timestamp: msg.timestamp,
                    fromMe: msg.fromMe,
                },
            });
        } else {
            // Simpan ke DB sebagai gagal
            await WhatsAppModel.createMessageLog({
                session_id,
                number,
                message,
                status: "FAILED",
                error_message: "Unknown failure",
            });

            return res.status(500).json({
                success: false,
                message: "Message send failed",
            });
        }
    } catch (error) {
        console.error("Send Message Error:", error);

        // Simpan error ke DB
        await WhatsAppModel.createMessageLog({
            session_id: req.body.session_id,
            number: req.body.number,
            message: req.body.message,
            status: "FAILED",
            error_message: error.message,
        });

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


async function logoutSession(req, res) {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                status: false,
                message: "Session ID is required.",
            });
        }

        const baseAuthPath = path.join(__dirname, ".wwebjs_auth");
        const sessionPath = path.join(baseAuthPath, sessionId);

        // ✅ Jika client aktif, logout dan destroy
        const client = clients[sessionId];
        if (client) {
            try {
                console.log(`🔒 Logging out and destroying client for session: ${sessionId}`);
                await client.logout();
                await client.destroy();
                delete clients[sessionId];
            } catch (err) {
                console.warn(`⚠️ Error destroying client for ${sessionId}:`, err.message);
            }
        }


        if (fs.existsSync(sessionPath)) {
            console.log(`🧹 Removing session folder: ${sessionPath}`);
            await fs.promises.rm(sessionPath, { recursive: true, force: true });
        }


        return res.status(200).json({
            status: true,
            message: `Session "${sessionId}" logged out and removed successfully.`,
        });

    } catch (error) {
        console.error("Logout Session Error:", error);
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
}

async function stats(req, res) {
    try {
        const stats = await WhatsAppModel.getMessageStats();
        return res.json({ success: true, data: stats });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Failed to get message stats', error: err.message });
    }
}


module.exports = {
    initWhatsApp,
    getQRCode,
    sendMessage,
    startSession,
    checkSession,
    reconnectSession,
    logoutSession,
    stats
};
