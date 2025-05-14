const User = require('../models/usersModel');
const response = require('../../../config/helpers/response');


const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll(req.db);
        response.success(res, 'Users fetched successfully', users);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findBy(id);
        if (!user) return response.error(res, 'User not found', { id });
        response.success(res, 'User fetched successfully', user);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;
    try {
        const updated = await User.update(req.db, id, { username });
        response.success(res, 'User updated successfully', updated);
    } catch (err) {
        response.error(res, 'Update failed', err);
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await User.remove(req.db, id);
        response.success(res, 'User deleted successfully', null, 204);
    } catch (err) {
        response.error(res, 'Delete failed', err);
    }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
