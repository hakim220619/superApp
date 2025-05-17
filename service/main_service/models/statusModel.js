const db = require('../../../config/db');

const createStatus = async (data) => {
    const [result] = await db.query(
        `INSERT INTO status (status_name, created_at) VALUES (?, NOW())`,
        [data.status_name]
    );

    const [rows] = await db.query(
        `SELECT id, status_name, created_at FROM status WHERE id = ?`,
        [result.insertId]
    );

    return { success: true, data: rows[0] };
};

const findAll = async () => {
    const [res] = await db.query(
        `SELECT id, status_name, created_at FROM status ORDER BY created_at ASC`
    );
    return res;
};

const findBy = async (filters) => {
    let query = `SELECT id, status_name, created_at FROM status`;
    const values = [];
    const conditions = [];

    if (filters.id) {
        conditions.push('id = ?');
        values.push(filters.id);
    }

    if (filters.status_name) {
        conditions.push('status_name = ?');
        values.push(filters.status_name);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at ASC';

    const [res] = await db.query(query, values);

    return res[0];
};

const update = async (id, data) => {
    const [res] = await db.query(
        `UPDATE status SET status_name = ?, created_at = created_at WHERE id = ?`,
        [data.status_name, id]
    );

    return { success: true, data: res };
};

const remove = async (id) => {
    await db.query('DELETE FROM status WHERE id = ?', [id]);
};

module.exports = {
    createStatus,
    findAll,
    findBy,
    update,
    remove
};
