const { queryOne, queryAll, queryInsertAndGet, queryExecute } = require('../../../config/helpers/helpers');

const createRoleStructure = async (data) => {
    const insertSql = `
        INSERT INTO role_structure (rs_name, rs_status, rs_created_at)
        VALUES (?, ?, NOW())
    `;
    const insertParams = [
        data.rs_name,
        Number(data.rs_status) || null
    ];
    const selectSql = `SELECT * FROM role_structure WHERE rs_id = ?`;

    const result = await queryInsertAndGet(insertSql, insertParams, selectSql);
    return { data: result };
};

const findAll = async () => {
    return await queryAll('SELECT * FROM role_structure ORDER BY rs_id ASC');
};

const findAllPublic = async () => {
    const sql = `
        SELECT * FROM role_structure 
        WHERE rs_id != 1 AND rs_status = 1
        ORDER BY rs_id ASC
    `;
    return await queryAll(sql);
};

const findBy = async (id) => {
    return await queryOne('SELECT * FROM role_structure WHERE rs_id = ?', [id]);
};

const update = async (id, data) => {
    const fields = [];
    const values = [];

    for (const key in data) {
        fields.push(`${key} = ?`);
        values.push(key === 'rs_status' ? Number(data[key]) : data[key]);
    }

    values.push(id); // for WHERE clause
    const sql = `UPDATE role_structure SET ${fields.join(', ')} WHERE rs_id = ?`;
    const result = await queryExecute(sql, values);

    return {
        message: 'Role structure updated',
        affectedRows: result.affectedRows
    };
};

const remove = async (id) => {
    const sql = `DELETE FROM role_structure WHERE rs_id = ?`;
    const result = await queryExecute(sql, [id]);
    return result;
};

module.exports = {
    createRoleStructure,
    findAll,
    findAllPublic,
    findBy,
    update,
    remove
};
