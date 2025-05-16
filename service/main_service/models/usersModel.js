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
      status, image, contact, address, active, created_at
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

const findByUid = async (uid) => {
  const [res] = await db.query('SELECT * FROM users WHERE uid = ?', [uid]);
  return res[0];
};

const findAll = async () => {
  const [res] = await db.query(
    `select ROW_NUMBER() OVER () AS no,  u.*, rs.rs_name , ra.ra_name ,r.role_name  from users u, role_structure rs, role_access ra, role r 
            where u.role_structure=rs.rs_id 
            and u.role_access=ra.ra_id 
            and u.role=r.role_id 
            ORDER BY ROW_NUMBER() OVER () asc`
  );
  return res;
};


const findAllById = async (user) => {
  const roleStructureJson = helpers.getRoleStructureJson();
  const profile = await getProfileById(user.id);

  let query = '';
  let params = null;

  if (user.role_structure !== roleStructureJson[3]) {
    if ([32, 33, 34].includes(user.role_structure)) {
      query = `
        SELECT 
          ROW_NUMBER() OVER () AS no,
          u.uid, u.google_id, u.nik, u.name, u.email, u.status, u.image, u.contact, u.active,
          rs.rs_name,
          IF(u.role_access IS NULL, "", (SELECT ra.ra_name FROM role_access ra WHERE ra.ra_id = u.role_access)) AS ra_name,
          IF(u.role IS NULL, "", (SELECT r.role_name FROM role r WHERE r.role_id = u.role)) AS role_name
        FROM users u
        JOIN role_structure rs ON u.role_structure = rs.rs_id
        WHERE rs.rs_name LIKE ?
      `;
      params = [`%${profile.rs_name}%`];
    } else {
      query = `
        SELECT 
          ROW_NUMBER() OVER () AS no,
          u.uid, u.google_id, u.nik, u.name, u.email, u.status, u.image, u.contact, u.active,
          rs.rs_name,
          IF(u.role_access IS NULL, "", (SELECT ra.ra_name FROM role_access ra WHERE ra.ra_id = u.role_access)) AS ra_name,
          IF(u.role IS NULL, "", (SELECT r.role_name FROM role r WHERE r.role_id = u.role)) AS role_name
        FROM users u
        JOIN role_structure rs ON u.role_structure = rs.rs_id
        WHERE rs.rs_id = ?
      `;
      params = [profile.role_structure];
    }
  } else {
    query = `
      SELECT 
        ROW_NUMBER() OVER () AS no,
        u.uid, u.google_id, u.nik, u.name, u.email, u.status, u.image, u.contact, u.active,
        rs.rs_name,
        ra.ra_name,
        r.role_name
      FROM users u
      JOIN role_structure rs ON u.role_structure = rs.rs_id
      JOIN role_access ra ON u.role_access = ra.ra_id
      JOIN role r ON u.role = r.role_id
    `;
  }

  const [res] = params ? await db.query(query, params) : await db.query(query);
  return { success: true, data: res };
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
      status = ?, image = ?, contact = ?, address = ?, active = ?, updated_at = NOW()
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
      data.contact || null,
      data.address || null,
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
  remove,
  findAllById
};
