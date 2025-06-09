const { queryOne, queryAll, queryInsertAndGet, queryExecute } = require('../../../config/helpers/helpers');

const createMenu = async (data) => {
    const insertSql = `INSERT INTO menu (
        name, icon, status, address, order_list, parent_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW())`;
    const insertParams = [
        data.name,
        data.icon || null,
        data.status,
        data.address || null,
        data.order_list || null,
        Number(data.parent_id) || null
    ];
    const selectSql = `SELECT * FROM menu WHERE id = ?`;

    const newMenu = await queryInsertAndGet(insertSql, insertParams, selectSql);
    return { data: newMenu };
};

const findAll = async () => {
    const sql = 'SELECT * FROM menu ORDER BY order_list ASC';
    return await queryAll(sql);
};

const findBy = async (id) => {
    const sql = 'SELECT * FROM menu WHERE id = ?';
    return await queryOne(sql, [id]);
};
const update = async (id, data) => {
    const fields = [];
    const values = [];

    for (const key in data) {
        if (data[key] !== undefined) {
            if (key === 'parent_id') {
                const val = Number(data[key]);
                fields.push(`${key} = ?`);
                values.push(isNaN(val) || val === 0 ? null : val);
            } else {
                fields.push(`${key} = ?`);
                values.push(data[key]);
            }
        }
    }

    values.push(id);
    console.log(values);

    const sql = `UPDATE menu SET ${fields.join(', ')} WHERE id = ?`;
    const result = await queryExecute(sql, values);

    return { message: 'Menu updated', affectedRows: result.affectedRows };
};


const remove = async (id) => {
    const sql = 'DELETE FROM menu WHERE id = ?';
    const result = await queryExecute(sql, [id]);
    return result;
};

module.exports = {
    createMenu,
    findAll,
    findBy,
    update,
    remove
};
