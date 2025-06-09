const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { queryOne, queryAll, queryInsertAndGet, queryExecute } = require('../../../config/helpers/helpers');
const helpers = require('../../../config/helpers/helpers');

const createUser = async (data) => {
  const hashedPassword = data.password ? await bcrypt.hash(data.password, 8) : null;
  const uid = helpers.generateUid();

  const insertSql = `
    INSERT INTO users (
      uid, google_id, nik, name, email, email_verified_at, password,
      role_structure, role_access, role, status, image, contact, address, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  const insertParams = [
    data.uid || uid,
    data.google_id || null,
    data.nik || null,
    data.name,
    data.email,
    data.email_verified_at || null,
    hashedPassword,
    data.role_structure || null,
    data.role_access || null,
    data.role || null,
    data.status || 4,
    data.image || null,
    data.contact || null,
    data.address || null,
  ];

  const selectSql = `
    SELECT uid, google_id, nik, name, email, email_verified_at,
           role_structure, role_access, role, status, image,
           contact, address
    FROM users WHERE uid = ?
  `;

  const newUser = await queryInsertAndGet(insertSql, insertParams, selectSql);
  return { success: true, data: newUser };
};

const findByEmail = async (email) => {
  const sql = 'SELECT * FROM users WHERE email = ?';
  return await queryOne(sql, [email]);
};

const findAllById = async (uid) => {
  let sql = `SELECT 
      u.*, 
      rs.rs_name, 
      ra.ra_name, 
      r.role_name,
      s.status_name
    FROM users u
    LEFT JOIN role_structure rs ON u.role_structure = rs.rs_id
    LEFT JOIN role_access ra ON u.role_access = ra.ra_id
    LEFT JOIN role r ON u.role = r.role_id
    LEFT JOIN status s ON u.status = s.id
    Where 1=1 And u.uid = ${uid}`;

  const params = [];

  // kalau uid ada, pakai queryOne untuk dapat 1 user, kalau tidak, queryAll untuk semua user
  const result = await queryOne(sql, params)

  console.log('SQL Query:', result);


  return { success: true, data: result };
};



const findAll = async () => {
  const sql = `
    SELECT 
      u.*, 
      rs.rs_name, 
      ra.ra_name, 
      r.role_name,
      s.status_name
    FROM users u
    LEFT JOIN role_structure rs ON u.role_structure = rs.rs_id
    LEFT JOIN role_access ra ON u.role_access = ra.ra_id
    LEFT JOIN role r ON u.role = r.role_id
    LEFT JOIN status s ON u.status = s.id
    ORDER BY u.created_at ASC
  `;
  return await queryAll(sql);
};

const findBy = async (filters) => {
  let query = `
    SELECT u.*, rs.rs_name, ra.ra_name, r.role_name, s.status_name
    FROM users u
    LEFT JOIN role_structure rs ON u.role_structure = rs.rs_id
    LEFT JOIN role_access ra ON u.role_access = ra.ra_id
    LEFT JOIN role r ON u.role = r.role_id
    LEFT JOIN status s ON u.status = s.id
  `;

  const values = [];
  const conditions = [];

  if (filters.id) {
    conditions.push('u.id = ?');
    values.push(filters.id);
  }
  if (filters.uid) {
    conditions.push('u.uid = ?');
    values.push(filters.uid);
  }
  if (filters.email) {
    conditions.push('u.email = ?');
    values.push(filters.email);
  }
  if (filters.status) {
    conditions.push('u.status = ?');
    values.push(filters.status);
  }
  if (filters.role) {
    conditions.push('u.role = ?');
    values.push(filters.role);
  }
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY u.created_at ASC';

  const result = await queryOne(query, values);
  return { success: true, data: result };

};


const update = async (id, data) => {
  if (isNaN(Number(id))) {
    throw new Error("ID harus berupa angka");
  }

  let hashedPassword = null;
  if (data.password) {
    hashedPassword = await bcrypt.hash(data.password, 8);
  }

  const statusId = data.status ? Number(data.status) : null;
  const contactValue = data.contact ? data.contact.toString() : null;

  if (data.old_image && data.image && data.old_image !== data.image) {
    const rootPath = path.resolve(__dirname, '..', '..', '..');
    const filePath = path.join(rootPath, data.old_image);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error('Gagal menghapus file lama:', err.message);
    }
  }

  const sql = `
    UPDATE users SET
      google_id = ?, nik = ?, name = ?, email = ?, email_verified_at = ?,
      password = COALESCE(?, password),
      role_structure = ?, role_access = ?, role = ?,
      status = ?, image = ?, contact = ?, address = ?, updated_at = NOW()
    WHERE id = ?
  `;

  const params = [
    data.google_id || null,
    data.nik || null,
    data.name,
    data.email,
    data.email_verified_at || null,
    hashedPassword,
    data.role_structure || null,
    data.role_access || null,
    data.role || null,
    statusId,
    data.image || null,
    contactValue,
    data.address || null,
    Number(id)
  ];

  const result = await queryExecute(sql, params);

  return { success: true, data: result };
};


const remove = async (id) => {
  const selectSql = 'SELECT users FROM tanah WHERE id = ?';
  const [data] = await queryExecute(selectSql, [id]);

  if (data && data.image) {

    const rootPath = path.resolve(__dirname, '..', '..', '..');

    const filePath = path.join(rootPath, data.image);

    if (fs.existsSync(filePath)) {
      try {

        fs.unlinkSync(filePath);
        console.log(`File ${data.image} deleted.`);
      } catch (err) {
        console.error('Failed to delete file:', err);
      }
    }
  }

  const sql = 'DELETE FROM users WHERE id = ?';
  await queryExecute(sql, [id]);
};

module.exports = {
  createUser,
  findByEmail,
  findAll,
  findBy,
  update,
  remove,
  findAllById
};
