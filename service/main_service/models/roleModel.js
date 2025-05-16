const db = require('../../../config/db');

const createMenu = async (data) => {
    const [result] = await db.query(
        `INSERT INTO role (
            role_name, role_status, role_created_at
        ) VALUES (?, ?, NOW())`,
        [
            data.role_name,
            data.role_status
        ]
    );

    const [rows] = await db.query(
        `SELECT * FROM role WHERE role_id = ?`,
        [result.insertId]
    );

    return { data: rows[0] };
};

const findAll = async () => {
    const [rows] = await db.query('SELECT * FROM role ORDER BY role_id ASC');
    return rows;
};

const findAllPublic = async () => {
    const [rows] = await db.query(`
        SELECT * FROM role 
        WHERE role_status = 'ACTIVE' 
        ORDER BY role_id ASC
    `);
    return rows;
};

const findBy = async (id) => {
    const [rows] = await db.query('SELECT * FROM role WHERE role_id = ?', [id]);
    return rows[0];
};

const update = async (id, data) => {
    const fields = [];
    const values = [];

    for (const key in data) {
        if (data[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
    }

    values.push(id);

    const sql = `UPDATE role SET ${fields.join(', ')} WHERE role_id = ?`;
    const [result] = await db.query(sql, values);

    return { message: 'Role updated', affectedRows: result.affectedRows };
};

const remove = async (id) => {
    const [result] = await db.query('DELETE FROM role WHERE role_id = ?', [id]);
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
