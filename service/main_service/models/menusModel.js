const { queryOne, queryAll, queryInsertAndGet, queryExecute } = require('../../../config/helpers/helpers');

const createMenu = async (data) => {
    const insertSql = `INSERT INTO menus (
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
    const selectSql = `SELECT * FROM menus WHERE id = ?`;

    const newMenu = await queryInsertAndGet(insertSql, insertParams, selectSql);
    return { data: newMenu };
};

const findAll = async () => {
    const sql = 'SELECT * FROM menus ORDER BY order_list ASC';
    return await queryAll(sql);
};

const getAllMenusByRoleStructure = async (data) => {
    let sql = `
        SELECT 
            m.id AS menu_id,
            m.name,
            m.order_list,
            COALESCE(ma.role_id, 0) AS role_id,
            COALESCE(ma.role_structure_id, 0) AS role_structure_id,
            COALESCE(ma.role_access_id, 0) AS role_access_id,
            COALESCE(ma.can_access, 0) AS can_access,
            COALESCE(ma.can_create, 0) AS can_create,
            COALESCE(ma.can_read, 0) AS can_read,
            COALESCE(ma.can_update, 0) AS can_update,
            COALESCE(ma.can_delete, 0) AS can_delete
        FROM menus m
        LEFT JOIN menu_access ma 
            ON m.id = ma.menu_id
            AND (ma.role_structure_id = ?)
        ORDER BY m.order_list ASC;
    `;

    const params = [data.role_structure_id, data.role_structure_id];
    return await queryAll(sql, params);
};

const findAllMenuAccess = async (filters = {}) => {
    const { role_id, role_structure_id, role_access_id } = filters;

    const paramsRole = [];
    const paramsAccess = [];

    const sqlBase = `
        SELECT 
            m.id AS menu_id,
            m.name,
            m.parent_id,
            m.icon,
            m.address,
            m.status,
            m.order_list,
            ma.role_id,
            ma.role_structure_id,
            ma.role_access_id,
            ma.can_create,
            ma.can_read,
            ma.can_update,
            ma.can_delete
        FROM menus m
        LEFT JOIN menu_access ma ON m.id = ma.menu_id
        WHERE 1=1
    `;

    // Role data
    let sqlRole = sqlBase;
    if (role_structure_id !== undefined && role_structure_id !== null) {
        sqlRole += ` AND ma.role_structure_id = ?`;
        paramsRole.push(role_structure_id);
    }
    if (role_id && role_id > 0) {
        sqlRole += ` AND ma.role_id = ?`;
        paramsRole.push(role_id);
    }

    // Role Access data
    let sqlAccess = sqlBase;
    if (role_structure_id !== undefined && role_structure_id !== null) {
        sqlAccess += ` AND ma.role_structure_id = ?`;
        paramsAccess.push(role_structure_id);
    }
    if (role_access_id && role_access_id > 0) {
        sqlAccess += ` AND ma.role_access_id = ?`;
        paramsAccess.push(role_access_id);
    }

    sqlRole += ` ORDER BY m.order_list ASC;`;
    sqlAccess += ` ORDER BY m.order_list ASC;`;

    // Ambil data
    const [roleData, accessData] = await Promise.all([
        queryAll(sqlRole, paramsRole),
        queryAll(sqlAccess, paramsAccess)
    ]);

    // Gabungkan data berdasarkan menu_id
    const grouped = {};
    [...roleData, ...accessData].forEach(row => {
        if (!grouped[row.menu_id]) {
            grouped[row.menu_id] = {
                menu_id: row.menu_id,
                name: row.name,
                parent_id: row.parent_id,
                icon: row.icon,
                order_list: row.order_list,
                address: row.address,
                status: row.status,
                roles: {},        // object key-value
                role_access: {},  // object key-value
                can_create: row.can_create,
                can_read: row.can_read,
                can_update: row.can_update,
                can_delete: row.can_delete
            };
        }

        if (row.role_id && row.role_id > 0) {
            grouped[row.menu_id].roles[row.role_id] = true;
        }

        if (row.role_access_id && row.role_access_id > 0) {
            grouped[row.menu_id].role_access[row.role_access_id] = true;
        }
    });
    console.log(grouped);

    return Object.values(grouped);
};


const findBy = async (id) => {
    const sql = 'SELECT * FROM menus WHERE id = ?';
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

    const sql = `UPDATE menus SET ${fields.join(', ')} WHERE id = ?`;
    const result = await queryExecute(sql, values);

    return { message: 'Menu updated', affectedRows: result.affectedRows };
};


const updateOrInsertMenuAccess = async (role_structure_id, data) => {
    console.log(role_structure_id);

    const upsert = async ({ menu_id, role_id = 0, role_access_id = 0, can_access, can_create, can_read, can_update, can_delete }) => {
        // cek apakah record sudah ada
        const checkSql = `
            SELECT id FROM menu_access
            WHERE menu_id = ? AND role_structure_id = ? AND role_id = ? AND role_access_id = ?
        `;
        const existing = await queryExecute(checkSql, [menu_id, role_structure_id, role_id, role_access_id]);

        if (existing.length > 0) {
            // update record
            const sql = `
                UPDATE menu_access 
                SET can_access = ?, can_create = ?, can_read = ?, can_update = ?, can_delete = ?, updated_at = NOW()
                WHERE menu_id = ? AND role_structure_id = ? AND role_id = ? AND role_access_id = ?
            `;
            await queryExecute(sql, [
                can_access ? 1 : 0,
                can_create ? 1 : 0,
                can_read ? 1 : 0,
                can_update ? 1 : 0,
                can_delete ? 1 : 0,
                menu_id,
                role_structure_id,
                role_id,
                role_access_id
            ]);
        } else {
            // insert record
            const sql = `
                INSERT INTO menu_access 
                    (menu_id, role_structure_id, role_id, role_access_id, can_access, can_create, can_read, can_update, can_delete, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            await queryExecute(sql, [
                menu_id,
                role_structure_id,
                role_id,
                role_access_id,
                can_access ? 1 : 0,
                can_create ? 1 : 0,
                can_read ? 1 : 0,
                can_update ? 1 : 0,
                can_delete ? 1 : 0
            ]);
        }
    };

    // Loop roles (role_id)
    for (const [role_id, value] of Object.entries(data.roles || {})) {
        if (!value) continue; // skip false
        await upsert({
            menu_id: data.menu_id,
            role_id,
            role_access_id: 0,
            can_access: data.can_access,
            can_create: data.can_create,
            can_read: data.can_read,
            can_update: data.can_update,
            can_delete: data.can_delete
        });
    }

    // Loop role_access (role_access_id)
    for (const [role_access_id, value] of Object.entries(data.role_access || {})) {
        if (!value) continue; // skip false
        await upsert({
            menu_id: data.menu_id,
            role_id: 0,
            role_access_id,
            can_access: data.can_access,
            can_create: data.can_create,
            can_read: data.can_read,
            can_update: data.can_update,
            can_delete: data.can_delete
        });
    }

    return { message: 'Menu access updated/inserted successfully' };
};


const remove = async (id) => {
    const sql = 'DELETE FROM menus WHERE id = ?';
    const result = await queryExecute(sql, [id]);
    return result;
};

module.exports = {
    createMenu,
    findAll,
    findBy,
    update,
    remove,
    findAllMenuAccess,
    getAllMenusByRoleStructure,
    updateOrInsertMenuAccess
};
