const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const cors = require("cors");
const puppeteer = require("puppeteer");
const multer = require("multer");
const { rimraf } = require("rimraf");
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

function initializeClient(sessionId, sessionPath) {
    return new Promise((resolve, reject) => {
        const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

        const client = new Client({
            authStrategy: new LocalAuth({ dataPath: sessionPath }),
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

        client.on("qr", async (qr) => {
            setTimeout(async () => {
                const qrBase64 = await qrcode.toDataURL(qr);
                resolve({ qr: qrBase64, status: "qr" });
            }, 1000);
        });

        client.on("ready", () => {
            console.log(`Client ${sessionId} ready`);
            resolve({ status: "ready" });
        });

        client.on("authenticated", () => {
            console.log(`Client ${sessionId} authenticated`);
        });

        client.on("auth_failure", (msg) => {
            console.error(`Auth failure for ${sessionId}:`, msg);
            reject(new Error(`Auth failed: ${msg}`));
        });

        client.on("disconnected", (reason) => {
            console.log(`Client ${sessionId} disconnected`, reason);
            client.destroy();
            delete clients[sessionId];
        });

        client.initialize();
        clients[sessionId] = client;
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

        // 🔹 Cek apakah folder session masih ada
        if (!fs.existsSync(sessionPath)) {
            return res.status(404).json({
                status: false,
                message: `Session "${sessionId}" not found on disk.`,
            });
        }

        const existingClient = clients[sessionId];

        // 🔹 Jika client sudah aktif dan ready
        if (existingClient && existingClient.info && existingClient.info.wid) {
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

        // 🔹 Jika client belum aktif → re-initialize client
        console.log(`Reconnecting session: ${sessionId}`);
        const qrCode = await initializeClient(sessionId, sessionPath);

        if (qrCode.qr) {
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

    } catch (error) {
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
            return res.status(400).json({ error: "Client not initialized or not found" });
        }

        const chatId = `${number}@c.us`;
        await client.sendMessage(chatId, message);

        res.status(200).json({ success: true, message: "Message sent successfully" });
    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    initWhatsApp,
    getQRCode,
    sendMessage,
    startSession,
    checkSession,
    reconnectSession
};
