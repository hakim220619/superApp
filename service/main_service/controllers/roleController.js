const Role = require('../models/roleModel'); // Ganti dengan model baru
const response = require('../../../config/helpers/response');

const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.findAll(req.db);
        response.success(res, 'Roles fetched successfully', roles);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const getRoleById = async (req, res) => {
    const { id } = req.params;
    try {
        const role = await Role.findBy(id);
        if (!role) return response.error(res, 'Role not found', null, 404);
        response.success(res, 'Role fetched successfully', role);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const updateRole = async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await Role.update(id, req.body);
        response.success(res, 'Role updated successfully', updated);
    } catch (err) {
        response.error(res, 'Update failed', err);
    }
};

const deleteRole = async (req, res) => {
    const { id } = req.params;
    try {
        await Role.remove(id);
        response.success(res, 'Role deleted successfully', null, 201);
    } catch (err) {
        response.error(res, 'Delete failed', err);
    }
};

const createRole = async (req, res) => {
    try {
        const result = await Role.createMenu(req.body);
        response.success(res, 'Role created successfully', result, 201);
    } catch (err) {
        response.error(res, 'Insert failed', err);
    }
};

module.exports = {
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    createRole
};
