const { queryOne, queryAll, queryInsertAndGet, queryExecute } = require('../../../config/helpers/helpers');

const createSewa = async (data) => {
    const insertSql = `
        INSERT INTO sewa (object_id, pembanding_id, created_at)
        VALUES (?, ?, NOW())
    `;
    const insertParams = [
        JSON.stringify(data.object_id),
        JSON.stringify(data.pembanding_id)
    ];
    const selectSql = `SELECT * FROM sewa WHERE id = ?`;

    const result = await queryInsertAndGet(insertSql, insertParams, selectSql);
    return { data: result };
};

const findAll = async () => {
    return await queryAll('SELECT * FROM sewa ORDER BY id ASC');
};

const findAllPublic = async () => {
    const sql = `
        SELECT * FROM sewa 
        ORDER BY id ASC
    `;
    return await queryAll(sql);
};

const findBy = async (id) => {
    return await queryOne('SELECT * FROM sewa WHERE id = ?', [id]);
};

const update = async (id, data) => {
    const fields = [];
    const values = [];

    for (const key in data) {
        if (key === 'object_id' || key === 'pembanding_id') {
            fields.push(`${key} = ?`);
            values.push(JSON.stringify(data[key]));
        } else {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
    }

    // Tambahkan updated_at = NOW()
    fields.push('updated_at = NOW()');

    values.push(id); // for WHERE clause
    const sql = `UPDATE sewa SET ${fields.join(', ')} WHERE id = ?`;
    const result = await queryExecute(sql, values);

    return {
        message: 'Data sewa berhasil diperbarui',
        affectedRows: result.affectedRows
    };
};


const remove = async (id) => {
    const sql = `DELETE FROM sewa WHERE id = ?`;
    const result = await queryExecute(sql, [id]);
    return result;
};

module.exports = {
    createSewa,
    findAll,
    findAllPublic,
    findBy,
    update,
    remove
};
