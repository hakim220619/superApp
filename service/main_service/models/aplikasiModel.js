const { queryOne, queryAll, queryInsertAndGet, queryExecute } = require('../../../config/helpers/helpers');

const createAplikasi = async (data) => {
    const insertSql = `
        INSERT INTO aplikasi 
        (owner, address, contact, title, name, logo, copyright, version, whatsapp_token, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const insertParams = [
        data.owner,
        data.address,
        data.contact,
        data.title,
        data.name,
        data.logo,
        data.copyright,
        data.version,
        data.whatsapp_token
    ];

    const selectSql = `
        SELECT id, owner, address, contact, title, name, logo, copyright, version, whatsapp_token, updated_at 
        FROM aplikasi WHERE id = ?
    `;

    const newAplikasi = await queryInsertAndGet(insertSql, insertParams, selectSql);
    return { success: true, data: newAplikasi };
};

const findAll = async () => {
    const sql = `
        SELECT id, owner, address, contact, title, name, logo, copyright, version, whatsapp_token, updated_at
        FROM aplikasi ORDER BY updated_at ASC
    `;
    return await queryAll(sql);
};

const findBy = async (filters) => {
    let query = `
        SELECT id, owner, address, contact, title, name, logo, copyright, version, whatsapp_token, updated_at 
        FROM aplikasi
    `;
    const values = [];
    const conditions = [];

    if (filters.id) {
        conditions.push('id = ?');
        values.push(filters.id);
    }

    if (filters.name) {
        conditions.push('name = ?');
        values.push(filters.name);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY updated_at ASC';

    return await queryOne(query, values);
};
const update = async (id, data) => {
    const sql = `
        UPDATE aplikasi SET
            owner = ?, 
            address = ?, 
            contact = ?, 
            title = ?, 
            name = ?, 
            logo = ?, 
            copyright = ?, 
            version = ?, 
            whatsapp_token = ?,
            whatsapp_url = ?,
            updated_at = now()
        WHERE id = ?
    `;
    const params = [
        data.owner,
        data.address,
        data.contact,
        data.title,
        data.name,
        data.logo,
        data.copyright,
        data.version,
        data.whatsapp_token,
        data.whatsapp_url,
        id
    ];

    const result = await queryExecute(sql, params);

    return { success: true, data: result };
};


const remove = async (db, id) => {
    const sql = 'DELETE FROM aplikasi WHERE id = ?';
    await queryExecute(sql, [id]);
};

module.exports = {
    createAplikasi,
    findAll,
    findBy,
    update,
    remove
};
