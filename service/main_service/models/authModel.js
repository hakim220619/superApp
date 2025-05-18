const { queryOne, queryExecute } = require('../../../config/helpers/helpers');

const saveUserToken = async (userId, token, expirationTime) => {
    const sql = `
    INSERT INTO user_tokens (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `;
    try {
        await queryExecute(sql, [userId, token, expirationTime]);
    } catch (err) {
        console.error('Error saving token:', err.message);
    }
};

const getUserToken = async (token) => {
    const sql = `SELECT * FROM user_tokens WHERE token = ?`;
    try {
        const tokenData = await queryOne(sql, [token]);
        if (!tokenData) return null;

        const now = new Date();
        if (new Date(tokenData.expires_at) < now) {
            return null; // Token expired
        }
        return tokenData;
    } catch (err) {
        console.error('Error retrieving token:', err.message);
        return null;
    }
};

const removeUserToken = async (token) => {
    const sql = `DELETE FROM user_tokens WHERE token = ?`;
    try {
        await queryExecute(sql, [token]);
    } catch (err) {
        console.error('Error removing token:', err.message);
    }
};

module.exports = { saveUserToken, getUserToken, removeUserToken };
