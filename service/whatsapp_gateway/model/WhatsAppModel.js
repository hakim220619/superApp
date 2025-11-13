const { queryInsertAndGet, queryAll, queryOne, queryExecute } = require('../../../config/helpers/helpers');

// Create a new message log
async function createMessageLog({
    session_id,
    number,
    message,
    status,
    msg_id = null,
    error_message = null,
}) {
    const insertSql = `
        INSERT INTO wa_message_logs 
        (session_id, number, message, status, msg_id, error_message, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [session_id, number, message, status, msg_id, error_message];

    await queryExecute(insertSql, params);

    // Return the newly created record
    const newRecord = await queryOne(
        `SELECT * FROM wa_message_logs WHERE id = LAST_INSERT_ID()`
    );

    return newRecord;
}

// Get all message logs
async function findAll() {
    const sql = `SELECT * FROM wa_message_logs ORDER BY created_at DESC`;
    return await queryAll(sql);
}

// Get a message log by ID
async function findBy(id) {
    const sql = `SELECT * FROM wa_message_logs WHERE id = ?`;
    return await queryOne(sql, [id]);
}

// Update status of a message
async function updateStatus(id, status) {
    const sql = `
        UPDATE wa_message_logs
        SET status = ?, updated_at = NOW()
        WHERE id = ?
    `;
    await queryExecute(sql, [status, id]);

    // Return the updated record
    return await findBy(id);
}

// Delete a message log
async function remove(id) {
    const sql = `DELETE FROM wa_message_logs WHERE id = ?`;
    return await queryExecute(sql, [id]);
}

// Get total messages sent vs not sent
async function getMessageStats() {
    const sql = `
        SELECT 
            SUM(CASE WHEN status = 'SENT' THEN 1 ELSE 0 END) AS sent,
            SUM(CASE WHEN status != 'SENT' THEN 1 ELSE 0 END) AS not_sent
        FROM wa_message_logs
    `;
    return await queryOne(sql);
}

module.exports = {
    createMessageLog,
    findAll,
    findBy,
    updateStatus,
    remove,
    getMessageStats, // ✅ new function
};
