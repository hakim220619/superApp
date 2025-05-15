const db = require('../../../config/db');

const createRoleStructure = async (data) => {
    const [result] = await db.query(
        `INSERT INTO role_structure (
            rs_name, rs_status, rs_created_at
        ) VALUES (?, ?, NOW())`,
        [
            data.rs_name,
            data.rs_status
        ]
    );

    const [rows] = await db.query(
        `SELECT *
         FROM role_structure WHERE rs_id = ?`,
        [result.insertId]
    );

    return { data: rows[0] };
};

const findAll = async (db) => {
    const [rows] = await db.execute('SELECT * FROM role_structure ORDER BY rs_id ASC');
    return rows;
};

const findAllPublic = async (db) => {
    const [rows] = await db.execute(`SELECT * FROM role_structure where rs_id != 4 and rs_status = 'ACTIVE' ORDER BY rs_id ASC`);
    return rows;
};

const findBy = async (id) => {
    const [rows] = await db.execute('SELECT * FROM role_structure WHERE rs_id = ?', [id]);
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

    const sql = `UPDATE role_structure SET ${fields.join(', ')} WHERE rs_id = ?`;
    const [result] = await db.execute(sql, values);

    return { message: 'Role structure updated', affectedRows: result.affectedRows };
};

const remove = async (db, id) => {
    const [result] = await db.execute('DELETE FROM role_structure WHERE rs_id = ?', [id]);
    return result;
};

module.exports = { createRoleStructure, findAll, findAllPublic, findBy, update, remove };
