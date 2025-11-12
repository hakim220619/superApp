const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const fs = require("fs");
const { SESSION_PATH } = require("../config");

let client = null;
let qrCode = null;
let ready = false;

/**
 * Inisialisasi WhatsApp Client
 */
async function init() {
    client = new Client({
        authStrategy: new LocalAuth({ dataPath: SESSION_PATH }),
        puppeteer: { headless: true, args: ["--no-sandbox"] },
    });

    client.on("qr", async (qr) => {
        qrCode = await qrcode.toDataURL(qr);
        console.log("🔑 QR Code generated. Please scan it.");
    });

    client.on("ready", () => {
        ready = true;
        console.log("✅ WhatsApp client is ready!");
    });

    client.on("authenticated", () => {
        console.log("🔐 WhatsApp authenticated.");
    });

    client.on("disconnected", (reason) => {
        ready = false;
        console.log("❌ WhatsApp disconnected:", reason);
    });

    await client.initialize();
}

/**
 * Ambil QR Code dalam bentuk DataURL (Base64)
 */
function getQrCode() {
    return qrCode;
}

/**
 * Kirim pesan teks
 */
async function sendMessage(number, message) {
    if (!client || !ready) throw new Error("WhatsApp client not ready");
    const formatted = number.includes("@c.us") ? number : `${number}@c.us`;
    await client.sendMessage(formatted, message);
}

/**
 * Kirim media (gambar, file, dll)
 */
async function sendMedia(number, filePath, caption = "") {
    if (!client || !ready) throw new Error("WhatsApp client not ready");
    const formatted = number.includes("@c.us") ? number : `${number}@c.us`;
    const media = MessageMedia.fromFilePath(filePath);
    await client.sendMessage(formatted, media, { caption });
    fs.unlinkSync(filePath);
}

module.exports = {
    init,
    getQrCode,
    sendMessage,
    sendMedia,
};
