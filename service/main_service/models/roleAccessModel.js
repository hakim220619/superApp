const { queryOne, queryAll, queryInsertAndGet, queryExecute } = require('../../../config/helpers/helpers');

const createRoleAccess = async (data) => {
    const insertSql = `
        INSERT INTO role_access (
            ra_name, ra_status, ra_created_at
        ) VALUES (?, ?, NOW())`;
    const insertParams = [
        data.ra_name,
        data.ra_status
    ];
    const selectSql = `SELECT * FROM role_access WHERE ra_id = ?`;

    const newRoleAccess = await queryInsertAndGet(insertSql, insertParams, selectSql);
    return { data: newRoleAccess };
};

const findAll = async () => {
    const sql = 'SELECT * FROM role_access ORDER BY ra_id ASC';
    return await queryAll(sql);
};

const findAllPublic = async () => {
    const sql = `
        SELECT * FROM role_access 
        WHERE ra_status = 'ACTIVE' 
        ORDER BY ra_id ASC`;
    return await queryAll(sql);
};

const findBy = async (id) => {
    const sql = 'SELECT * FROM role_access WHERE ra_id = ?';
    return await queryOne(sql, [id]);
};

const update = async (id, data) => {
    const fields = [];
    const values = [];

    for (const key in data) {
        fields.push(`${key} = ?`);
        values.push(key === 'ra_status' ? Number(data[key]) : data[key]);
    }

    values.push(id);

    const sql = `UPDATE role_access SET ${fields.join(', ')} WHERE ra_id = ?`;
    const result = await queryExecute(sql, values);

    return { message: 'Role access updated', affectedRows: result.affectedRows };
};

const remove = async (id) => {
    const sql = 'DELETE FROM role_access WHERE ra_id = ?';
    const result = await queryExecute(sql, [id]);
    return result;
};

module.exports = {
    createRoleAccess,
    findAll,
    findAllPublic,
    findBy,
    update,
    remove
};
