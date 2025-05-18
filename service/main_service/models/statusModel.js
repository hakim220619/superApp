const { queryOne, queryAll, queryInsertAndGet, queryExecute } = require('../../../config/helpers/helpers');

const createStatus = async (data) => {
    const insertSql = `INSERT INTO status (status_name, created_at) VALUES (?, NOW())`;
    const insertParams = [data.status_name];
    const selectSql = `SELECT id, status_name, created_at FROM status WHERE id = ?`;

    const newStatus = await queryInsertAndGet(insertSql, insertParams, selectSql);
    return { success: true, data: newStatus };
};

const findAll = async () => {
    const sql = `SELECT id, status_name, created_at FROM status ORDER BY created_at ASC`;
    return await queryAll(sql);
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

    return await queryOne(query, values);
};

const update = async (id, data) => {
    const sql = `UPDATE status SET status_name = ?, created_at = created_at WHERE id = ?`;
    const params = [data.status_name, id];
    const result = await queryExecute(sql, params);
    return { success: true, data: result };
};

const remove = async (id) => {
    const sql = 'DELETE FROM status WHERE id = ?';
    await queryExecute(sql, [id]);
};

module.exports = {
    createStatus,
    findAll,
    findBy,
    update,
    remove
};
