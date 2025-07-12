const User = require('../models/usersModel');
const response = require('../../../config/helpers/response');


const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();

        response.success(res, 'Users fetched successfully', users);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const getUserById = async (req, res) => {

    try {
        const user = await User.findBy(req.params);

        if (!user) return response.error(res, 'User not found', user);
        response.success(res, 'User fetched successfully', user, 201);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};


const createUsers = async (req, res) => {
    try {
        const result = await User.createUser(req.body);
        response.success(res, 'User created successfully', result, 201);
    } catch (err) {
        response.error(res, 'Insert failed', err);
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    try {
        if (req.file) {
            req.body.image = req.file.path;
        }
        const updated = await User.update(id, req.body);
        response.success(res, 'User updated successfully', updated, 201);
    } catch (err) {
        response.error(res, 'Update failed', err);
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await User.remove(id);
        response.success(res, 'User deleted successfully', null, 201);
    } catch (err) {
        response.error(res, 'Delete failed', err);
    }
};


const verifikasiUser = async (req, res) => {
    if (!req.body) {
        return response.error(res, 'Data tidak lengkap', 400);
    }
    try {
        const result = await User.verifikasi(req.body);
        return response.success(res, 'User berhasil diverifikasi', result);
    } catch (err) {
        return response.error(res, err.message || 'Verifikasi gagal', 500);
    }
};


module.exports = { getAllUsers, getUserById, createUsers, updateUser, deleteUser, verifikasiUser };
