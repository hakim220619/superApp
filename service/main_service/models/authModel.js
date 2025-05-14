const db = require('../../../config/db');  // Import database connection

// Function to save token when the user logs in
const saveUserToken = async (userId, token, expirationTime) => {
    const query = `
        INSERT INTO user_tokens (user_id, token, expires_at)
        VALUES (?, ?, ?)
    `;
    try {
        await db.execute(query, [userId, token, expirationTime]);
    } catch (err) {
        console.error('Error saving token:', err.message);
    }
};

// Function to check if a token exists and is not expired in the database
const getUserToken = async (token) => {
    const query = `
        SELECT * FROM user_tokens
        WHERE token = ?
    `;
    try {
        const [rows] = await db.execute(query, [token]);
        if (rows.length > 0) {
            const tokenData = rows[0];
            // Check if token has expired
            const now = new Date();
            if (new Date(tokenData.expires_at) < now) {
                return null; // Token has expired
            }
            return tokenData;  // Return token data if not expired
        }
        return null;  // No token found
    } catch (err) {
        console.error('Error retrieving token:', err.message);
        return null;
    }
};

const removeUserToken = async (token) => {
    const query = `
        DELETE FROM user_tokens
        WHERE token = ?
    `;
    try {
        await db.execute(query, [token]);
    } catch (err) {
        console.error('Error removing token:', err.message);
    }
};

module.exports = { saveUserToken, getUserToken, removeUserToken };
