const bcrypt = require('bcryptjs');
const db = require('../../../config/db');
const helpers = require('../../../config/helpers/helpers');


const createUser = async (data) => {
  const hashedPassword = data.password ? await bcrypt.hash(data.password, 8) : null;
  const uid = helpers.generateUid();

  const [result] = await db.query(
    `INSERT INTO users (
      uid, google_id, nik, name, email, email_verified_at, password, role_structure, role_access, role,
      status, image, contact, address, active, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
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
      data.active || 'ON'
    ]
  );

  const [rows] = await db.query(
    `SELECT uid, google_id, nik, name, email, email_verified_at,
            role_structure, role_access, role, status, image,
            contact, address, active FROM users WHERE uid = ?`,
    [data.uid]
  );

  return { success: true, data: rows[0] };
};

const findByEmail = async (email) => {
  const [res] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return res[0];
};

const findAllById = async (uid) => {
  const [res] = await db.query('SELECT * FROM users WHERE id = ?', [uid]);
  return res[0];
};

const findAll = async () => {
  const [res] = await db.query(
    `SELECT 
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

    ORDER BY u.created_at ASC`
  );
  return res;
};



const findBy = async (filters) => {
  let query = `
    SELECT u.*, rs.rs_name, ra.ra_name, r.role_name, s.status_name
    FROM users u
    left JOIN role_structure rs ON u.role_structure = rs.rs_id
    left JOIN role_access ra ON u.role_access = ra.ra_id
    left JOIN role r ON u.role = r.role_id
    left join status s ON u.status = s.id
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
  if (filters.active) {
    conditions.push('u.active = ?');
    values.push(filters.active);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY u.created_at ASC';

  const [res] = await db.query(query, values);

  return res[0];
};


const update = async (id, data) => {
  if (isNaN(Number(id))) {
    throw new Error("ID harus berupa angka");
  }

  // Jika password tidak dikirim, jangan update password
  let hashedPassword = null;
  if (data.password) {
    hashedPassword = await bcrypt.hash(data.password, 8);
  }

  // Pastikan status dan contact berupa angka jika perlu
  const statusId = data.status ? Number(data.status) : null;
  const contactValue = data.contact ? data.contact.toString() : null; // biasanya nomor disimpan string

  const [res] = await db.query(
    `UPDATE users SET
      google_id = ?, nik = ?, name = ?, email = ?, email_verified_at = ?,
      password = COALESCE(?, password),
      role_structure = ?, role_access = ?, role = ?,
      status = ?, image = ?, contact = ?, address = ?, updated_at = NOW()
    WHERE id = ?`,
    [
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
    ]
  );

  return { success: true, data: res };
};


const remove = async (uid) => {
  await db.query('DELETE FROM users WHERE id = ?', [uid]);
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
