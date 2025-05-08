const bcrypt = require('bcryptjs');
const db = require('../../../config/db');

const createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 8)
  const hashedPin = data.pin ? await bcrypt.hash(data.pin.toString(), 8) : null

  const [result] = await db.query(
    `INSERT INTO users (
      username, password, full_name, email, pin, image, address, is_active, gender, role_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      data.username,
      hashedPassword,
      data.full_name,
      data.email,
      hashedPin,
      data.image || null,
      data.address || null,
      data.is_active,
      data.gender || null,
      data.role_id
    ]
  )

  const [rows] = await db.query(
    'SELECT id, username, full_name, email, image, address, is_active, gender, role_id FROM users WHERE id = ?',
    [result.insertId]
  );
  return { success: true, data: rows[0] };
}




const findByUsername = async (username) => {
  const [res] = await db.query('SELECT username FROM users WHERE username = ?', [username]);
  return res[0];
};
const findByEmail = async (username) => {
  const [res] = await db.query('SELECT email FROM users WHERE email = ?', [username]);
  return res[0];
};

const findAll = async () => {
  const [res] = await db.query('SELECT id, username, full_name, email FROM users');
  return res;
};

const findBy = async (filters) => {
  let query = 'SELECT * FROM users'
  const values = []
  const conditions = []

  // Bangun kondisi WHERE jika ada filter
  if (filters.username) {
    conditions.push('username = ?')
    values.push(filters.username)
  }

  if (filters.email) {
    conditions.push('email = ?')
    values.push(filters.email)
  }

  if (filters.is_active !== undefined) {
    conditions.push('is_active = ?')
    values.push(filters.is_active)
  }

  if (filters.role_id) {
    conditions.push('role_id = ?')
    values.push(filters.role_id)
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }

  const [res] = await db.query(query, values)
  return res[0]
};

const update = async (id, { username, full_name, email, pin, image, address, is_active, gender, role_id }) => {
  const [res] = await db.query(
    'UPDATE users SET username = ?, full_name = ?, email = ?, pin = ?, image = ?, address = ?, is_active = ?, gender = ?, role_id = ? WHERE id = ? ' +
    'RETURNING id, username, full_name, email, pin, image, address, is_active, gender, role_id',
    [username, full_name, email, pin, image, address, is_active, gender, role_id, id]
  );
  return res[0];
};

const remove = async (id) => {
  await db.query('DELETE FROM users WHERE id = ?', [id]);
};

module.exports = {
  createUser,
  findByUsername,
  findByEmail,
  findAll,
  findBy,
  update,
  remove
};
