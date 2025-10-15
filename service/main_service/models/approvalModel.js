const {
    queryOne,
    queryAll,
    queryInsertAndGet,
    queryExecute
} = require('../../../config/helpers/helpers');

// ✅ CREATE approval
const create = async (data) => {
    const sqlInsert = `
      INSERT INTO approval (
        deskripsi,
        role_id,
        status_id,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, NOW(), NOW())
    `;
    const paramsInsert = [
        data.deskripsi,
        JSON.stringify(data.role_id || []),
        data.status_id || 0
    ];

    const sqlSelect = `SELECT * FROM approval WHERE id = ?`;
    const row = await queryInsertAndGet(sqlInsert, paramsInsert, sqlSelect);
    return { data: row };
};

const generateApproval = async (data) => {
    const sqlGetList = `SELECT * FROM list_approval WHERE status_id = ?`;
    const list = await queryOne(sqlGetList, [1]);
    if (!list) throw new Error('List approval not found');

    let roles = [];

    if (typeof list.role_id === 'string' && list.role_id.trim().startsWith('[')) {
        try {
            roles = JSON.parse(list.role_id);
        } catch {
            throw new Error('Invalid JSON format in role_id');
        }
    } else if (typeof list.role_id === 'string') {
        roles = list.role_id
            .split(',')
            .map(r => parseInt(r.trim()))
            .filter(n => !isNaN(n));
    } else if (Array.isArray(list.role_id)) {
        roles = list.role_id;
    } else {
        throw new Error('role_id is not a valid format');
    }

    const sqlCheck = `
        SELECT COUNT(*) AS count 
        FROM approval 
        WHERE list_approval_id = ? 
          AND source_id = ? 
          AND approval_type = ?
    `;
    const paramsCheck = [list.id, data.source_id, data.type];
    const existing = await queryOne(sqlCheck, paramsCheck);

    if (existing && existing.count > 0) {
        return { message: 'Approval already exists, skipping insert' };
    }

    let approvalOrder = 1;
    const approvals = [];

    for (const roleId of roles) {
        const isFirstOrder = approvalOrder === 1;

        const sqlInsert = `
            INSERT INTO approval (
                approval_order,
                list_approval_id,
                role_id,
                source_id,
                approval_type,
                status,
                user_id,
                deskripsi,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const paramsInsert = [
            approvalOrder,
            list.id,
            roleId,
            data.source_id,
            data.type,
            isFirstOrder ? data.status : 'pending',
            isFirstOrder ? data.user_id : null,
            data.deskripsi
        ];

        const sqlSelect = `SELECT * FROM approval WHERE id = ?`;
        const approval = await queryInsertAndGet(sqlInsert, paramsInsert, sqlSelect);
        approvals.push(approval);

        approvalOrder++;
    }

    return { data: approvals };
};



// ✅ GET all approvals
const findAll = async () => {
    const sql = 'SELECT * FROM approval ORDER BY id ASC';
    return await queryAll(sql);
};


const approvalActive = async (data) => {
    const sql = `
      SELECT *
      FROM approval
      WHERE source_id = ?
        AND approval_type = ?
      ORDER BY approval_order ASC
    `;
    const params = [data.source_id, data.type];
    return await queryAll(sql, params);
};
const approvalUpdate = async (data) => {
    // 🔍 1. Check if record exists
    const sqlCheck = `
        SELECT id, status, deskripsi, user_id
        FROM approval
        WHERE source_id = ?
          AND approval_type = ?
          AND role_id = ?
        LIMIT 1
    `;
    const paramsCheck = [data.source_id, data.type, data.role_id];
    const existing = await queryOne(sqlCheck, paramsCheck);

    if (!existing) {
        console.warn('⚠️ No matching approval found for update:', paramsCheck);
        return { success: false, message: 'Approval record not found' };
    }


    // 🛠️ 2. Proceed with update
    const sqlUpdate = `
        UPDATE approval
        SET 
            status = ?,
            deskripsi = ?, 
            user_id = ?,
            updated_at = NOW()
        WHERE 
            source_id = ?
            AND approval_type = ?
            AND role_id = ?
    `;

    const paramsUpdate = [
        data.status,
        data.deskripsi,
        data.user_id,
        data.source_id,
        data.type,
        data.role_id
    ];


    const result = await queryExecute(sqlUpdate, paramsUpdate);

    if (result.affectedRows === 0) {
        throw new Error('Update failed — possibly no matching record or no changes made.');
    }

    return { "user_id": data.user_id }
};



// ✅ GET approval by ID
const findById = async (id) => {
    const sql = 'SELECT * FROM approval WHERE id = ?';
    return await queryOne(sql, [id]);
};

// ✅ UPDATE approval
const update = async (id, data) => {
    const fields = [];
    const values = [];

    for (const key in data) {
        if (key === 'role_id') {
            fields.push(`${key} = ?`);
            values.push(JSON.stringify(data[key]));
        } else {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
    }

    values.push(id);
    const sql = `
      UPDATE approval
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = ?
    `;

    const result = await queryExecute(sql, values);
    return { message: 'Approval updated', affectedRows: result.affectedRows };
};

// ✅ DELETE approval
const remove = async (id) => {
    const sql = 'DELETE FROM approval WHERE id = ?';
    const result = await queryExecute(sql, [id]);
    return result;
};

module.exports = {
    create,
    findAll,
    findById,
    update,
    remove,
    generateApproval,
    approvalActive,
    approvalUpdate
};
