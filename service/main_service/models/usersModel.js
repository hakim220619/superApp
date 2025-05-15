const bcrypt = require('bcryptjs');
const db = require('../../../config/db');
const helpers = require('../../../config/helpers/helpers');
const createUser = async (data) => {
  const hashedPassword = data.password ? await bcrypt.hash(data.password, 8) : null;
  const uid = helpers.generateUid();

  const [result] = await db.query(
    `INSERT INTO users (
      uid, google_id, nik, name, email, email_verified_at, password,
      remember_token, role_structure, role_access, role,
      status, image, kontak, alamat, active, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      data.uid || uid,
      data.google_id || null,
      data.nik || null,
      data.name,
      data.email,
      data.email_verified_at || null,
      hashedPassword,
      data.remember_token || null,
      data.role_structure || null,
      data.role_access || null,
      data.role || null,
      data.status || 'VERIFICATION',
      data.image || null,
      data.kontak || null,
      data.alamat || null,
      data.active || 'ON'
    ]
  );

  const [rows] = await db.query(
    `SELECT uid, google_id, nik, name, email, email_verified_at,
            role_structure, role_access, role, status, image,
            kontak, alamat, active FROM users WHERE uid = ?`,
    [data.uid]
  );

  return { success: true, data: rows[0] };
};

const findByEmail = async (email) => {
  const [res] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return res[0];
};

const findByUid = async (uid) => {
  const [res] = await db.query('SELECT * FROM users WHERE uid = ?', [uid]);
  return res[0];
};

const findAll = async () => {
  const [res] = await db.query(
    'SELECT uid, google_id, nik, name, email, status, image, kontak, active FROM users'
  );
  return res;
};

const findBy = async (filters) => {
  let query = 'SELECT * FROM users';
  const values = [];
  const conditions = [];

  if (filters.uid) {
    conditions.push('uid = ?');
    values.push(filters.uid);
  }

  if (filters.email) {
    conditions.push('email = ?');
    values.push(filters.email);
  }

  if (filters.status) {
    conditions.push('status = ?');
    values.push(filters.status);
  }

  if (filters.role) {
    conditions.push('role = ?');
    values.push(filters.role);
  }

  if (filters.active) {
    conditions.push('active = ?');
    values.push(filters.active);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  const [res] = await db.query(query, values);
  return res[0];
};

const update = async (uid, data) => {
  const [res] = await db.query(
    `UPDATE users SET
      google_id = ?, nik = ?, name = ?, email = ?, email_verified_at = ?,
      password = ?, remember_token = ?, role_structure = ?, role_access = ?, role = ?,
      status = ?, image = ?, kontak = ?, alamat = ?, active = ?, updated_at = NOW()
    WHERE uid = ?`,
    [
      data.google_id || null,
      data.nik || null,
      data.name,
      data.email,
      data.email_verified_at || null,
      data.password ? await bcrypt.hash(data.password, 8) : null,
      data.remember_token || null,
      data.role_structure || null,
      data.role_access || null,
      data.role || null,
      data.status,
      data.image || null,
      data.kontak || null,
      data.alamat || null,
      data.active,
      uid
    ]
  );

  return res;
};

const remove = async (uid) => {
  await db.query('DELETE FROM users WHERE uid = ?', [uid]);
};

module.exports = {
  createUser,
  findByEmail,
  findByUid,
  findAll,
  findBy,
  update,
  remove
};
