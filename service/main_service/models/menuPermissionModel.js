const {
    queryOne,
    queryAll,
    queryInsertAndGet,
    queryExecute
} = require('../../../config/helpers/helpers');

const createMenuPermission = async (data) => {
    // Konversi nilai boolean ke 0/1
    const can_create = data.can_create ? 1 : 0;
    const can_read = data.can_read ? 1 : 0;
    const can_update = data.can_update ? 1 : 0;
    const can_delete = data.can_delete ? 1 : 0;

    // Validasi eksistensi kombinasi menu_id + rs_id + ra_id + role_id
    const checkSql = `
        SELECT id FROM menu_permission 
        WHERE menu_id = ? AND rs_id = ? AND ra_id = ? AND role_id = ?
    `;
    const checkParams = [
        data.menu_id,
        data.role_structure,
        data.role_access,
        data.role
    ];

    const existing = await queryOne(checkSql, checkParams);

    if (existing && existing.id) {
        // Jika sudah ada, return tanpa insert
        return {
            success: false,
            message: 'This menu permission combination already exists.',
            data: existing
        };
    }

    // SQL insert baru
    const insertSql = `
        INSERT INTO menu_permission (
            menu_id,
            rs_id,
            ra_id,
            role_id,
            status,
            can_create,
            can_read,
            can_update,
            can_delete,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const insertParams = [
        data.menu_id,
        data.role_structure,
        data.role_access,
        data.role,
        data.status,
        can_create,
        can_read,
        can_update,
        can_delete
    ];

    const selectSql = `SELECT * FROM menu_permission WHERE id = ?`;
    const newPermission = await queryInsertAndGet(insertSql, insertParams, selectSql);

    return {
        success: true,
        message: 'Permission created successfully.',
        data: newPermission
    };
};


const findAll = async () => {
    const sql = 'SELECT * FROM menu_permission ORDER BY id DESC';
    return await queryAll(sql);
};

const findBy = async (id) => {
    const sql = 'SELECT * FROM menu_permission WHERE id = ?';
    return await queryOne(sql, [id]);
};

const findByDetail = async (id) => {
    const sql = 'SELECT * FROM menu_access WHERE role_structure_id = ?';
    return await queryAll(sql, [id]);
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
    const sql = `UPDATE menu_permission SET ${fields.join(', ')} WHERE id = ?`;
    const result = await queryExecute(sql, values);

    return { message: 'Menu permission updated', affectedRows: result.affectedRows };
};

const remove = async (id) => {
    const sql = 'DELETE FROM menu_permission WHERE id = ?';
    const result = await queryExecute(sql, [id]);
    return result;
};

module.exports = {
    createMenuPermission,
    findAll,
    findByDetail,
    findBy,
    update,
    remove
};
