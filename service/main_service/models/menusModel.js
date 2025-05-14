const db = require('../../../config/db');


const createMenu = async (data) => {
    const [result] = await db.query(
        `INSERT INTO menu (
            name, icon, is_active, address, order_list, parent_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`, // Menghapus ? pada created_at
        [
            data.name,
            data.icon || null,
            data.is_active,
            data.address || null,
            data.order_list || null,
            data.parent_id || null
        ]
    );

    const [rows] = await db.query(
        `SELECT *
         FROM menu WHERE id = ?`,
        [result.insertId]
    );

    return { data: rows[0] };
};



const findAll = async (db) => {
    const [rows] = await db.execute('SELECT * FROM menu ORDER BY order_list ASC');
    return rows;
};

const findBy = async (id) => {
    const [rows] = await db.execute('SELECT * FROM menu WHERE id = ?', [id]);
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

    const sql = `UPDATE menu SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await db.execute(sql, values);

    return { message: 'Menu updated', affectedRows: result.affectedRows };
};

const remove = async (db, id) => {
    const [result] = await db.execute('DELETE FROM menu WHERE id = ?', [id]);
    return result;
};

module.exports = { createMenu, findAll, findBy, update, remove };
