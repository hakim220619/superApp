const { queryOne, queryAll, queryInsertAndGet, queryExecute } = require('../../../config/helpers/helpers');

const createMenu = async (data) => {
    const sqlInsert = `
    INSERT INTO role (
      role_name, role_status, role_created_at
    ) VALUES (?, ?, NOW())
  `;
    const paramsInsert = [data.role_name, data.role_status];
    const sqlSelect = `SELECT * FROM role WHERE role_id = ?`;

    const row = await queryInsertAndGet(sqlInsert, paramsInsert, sqlSelect);
    return { data: row };
};

const findAll = async () => {
    const sql = 'SELECT * FROM role ORDER BY role_id ASC';
    return await queryAll(sql);
};

const findAllPublic = async () => {
    const sql = `
    SELECT * FROM role
    WHERE role_status = 'ACTIVE'
    ORDER BY role_id ASC
  `;
    return await queryAll(sql);
};

const findBy = async (id) => {
    const sql = 'SELECT * FROM role WHERE role_id = ?';
    return await queryOne(sql, [id]);
};

const update = async (id, data) => {
    const fields = [];
    const values = [];

    for (const key in data) {
        fields.push(`${key} = ?`);
        values.push(key === 'role_status' ? Number(data[key]) : data[key]);
    }

    values.push(id);
    const sql = `UPDATE role SET ${fields.join(', ')} WHERE role_id = ?`;

    const result = await queryExecute(sql, values);
    return { message: 'Role updated', affectedRows: result.affectedRows };
};

const remove = async (id) => {
    const sql = 'DELETE FROM role WHERE role_id = ?';
    const result = await queryExecute(sql, [id]);
    return result;
};

module.exports = {
    createMenu,
    findAll,
    findAllPublic,
    findBy,
    update,
    remove,
};
