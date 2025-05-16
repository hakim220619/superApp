const db = require('../../../config/db');

const createMenu = async (data) => {
    const [result] = await db.query(
        `INSERT INTO role_access (
            ra_name, ra_status, ra_created_at, ra_created_by
        ) VALUES (?, ?, NOW(), ?)`,
        [
            data.ra_name,
            data.ra_status,
            data.ra_created_by
        ]
    );

    const [rows] = await db.query(
        `SELECT * FROM role_access WHERE ra_id = ?`,
        [result.insertId]
    );

    return { data: rows[0] };
};

const findAll = async (db) => {
    const [rows] = await db.query('SELECT * FROM role_access ORDER BY ra_id ASC');
    return rows;
};

const findAllPublic = async (db) => {
    const [rows] = await db.query(`
        SELECT * 
        FROM role_access 
        WHERE ra_status = 'ACTIVE' 
        ORDER BY ra_id ASC
    `);
    return rows;
};

const findBy = async (id) => {
    const [rows] = await db.query('SELECT * FROM role_access WHERE ra_id = ?', [id]);
    return rows[0];
};

const update = async (db, id, data) => {
    const fields = [];
    const values = [];

    for (const key in data) {
        if (data[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
    }

    values.push(id);

    const sql = `UPDATE role_access SET ${fields.join(', ')}, ra_updated_at = NOW() WHERE ra_id = ?`;
    const [result] = await db.query(sql, values);

    return { message: 'Role access updated', affectedRows: result.affectedRows };
};

const remove = async (db, id) => {
    const [result] = await db.query('DELETE FROM role_access WHERE ra_id = ?', [id]);
    return result;
};

module.exports = {
    createMenu,
    findAll,
    findAllPublic,
    findBy,
    update,
    remove
};
