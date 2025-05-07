const bcrypt = require('bcryptjs');
const db = require('../../../db');


const createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 8);
  const hashedPin = await bcrypt.hash(data.pin.toString(), 8);
  const [result] = await db.query(
    'INSERT INTO users (username, password, full_name, email, pin, image, address, is_active, gender, role_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
    [
      data.username,
      hashedPassword,
      data.full_name,
      data.email,
      hashedPin,
      data.image,
      data.address,
      data.is_active,
      data.gender,
      data.role_id
    ]
  );

  const userId = result.insertId;

  const [rows] = await db.query(
    'SELECT id, username, full_name, email, image, address, is_active, gender, role_id FROM users WHERE id = ?',
    [userId]
  );
  return { success: true, data: rows[0] };
};



const findByUsername = async (username) => {
  const [res] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
  return res[0];
};

const findAll = async () => {
  const [res] = await db.query('SELECT id, username, full_name, email FROM users');
  return res;
};

const findById = async (id) => {
  const [res] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return res[0];
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
  findAll,
  findById,
  update,
  remove
};
