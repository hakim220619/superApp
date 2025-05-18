const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // Tambahkan ini
const db = require('../../config/db');

// UID Generator
function generateUid() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const random = crypto.randomBytes(4).toString('hex');
    return `${timestamp}${random}`;
}

// Konfigurasi Multer untuk Upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folderName = req.params.folderName || 'default';
        const dir = path.join('uploads', folderName);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `${generateUid()}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({ storage });

const sendMessage = async (url, token, receiver, message, maxRetries = 5, delay = 1000) => {
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            const response = await axios.post(
                url,
                {
                    sessionId: token,
                    number: receiver,
                    message: message
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            return {
                status: "success",
                message: "Message sent successfully",
                data: response.data,
            };

        } catch (error) {
            console.error(`Error sending message on attempt ${attempts + 1}: ${error.message}`);
            attempts++;

            if (attempts < maxRetries) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                return {
                    status: "error",
                    message: "Failed to send message after multiple attempts",
                    error: error.message,
                };
            }
        }
    }
};

function getRoleStructureJson() {
    return ['1', '2', '3', '4'];
}



const queryOne = async (sql, params = []) => {
    const [rows] = await db.query(sql, params);
    return rows[0] || null;
};

const queryAll = async (sql, params = []) => {
    const [rows] = await db.query(sql, params);
    return rows;
};

const queryInsertAndGet = async (insertSql, insertParams, selectSql) => {
    const [result] = await db.query(insertSql, insertParams);
    const [rows] = await db.query(selectSql, [result.insertId]);
    return rows[0] || null;
};

const queryExecute = async (sql, params = []) => {
    const [result] = await db.query(sql, params);
    return result;
};
// Export semua fungsi
module.exports = {
    generateUid,
    upload,
    sendMessage,
    getRoleStructureJson,
    queryOne,
    queryAll,
    queryInsertAndGet,
    queryExecute
};
