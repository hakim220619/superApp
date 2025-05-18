const RoleAccess = require('../models/roleAccessModel');
const response = require('../../../config/helpers/response');

const getAllRoleAccesses = async (req, res) => {
    try {
        const roleAccesses = await RoleAccess.findAll(req.db);
        response.success(res, 'Role accesses fetched successfully', roleAccesses);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const getAllRoleAccessesPublic = async (req, res) => {
    try {
        const roleAccesses = await RoleAccess.findAllPublic(req.db);
        response.success(res, 'Role accesses fetched successfully', roleAccesses);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const getRoleAccessById = async (req, res) => {
    const { id } = req.params;
    try {
        const roleAccess = await RoleAccess.findBy(id);
        if (!roleAccess) return response.error(res, 'Role access not found', null, 404);
        response.success(res, 'Role access fetched successfully', roleAccess);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const updateRoleAccess = async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await RoleAccess.update(id, req.body);
        response.success(res, 'Role access updated successfully', updated);
    } catch (err) {
        response.error(res, 'Update failed', err);
    }
};

const deleteRoleAccess = async (req, res) => {
    const { id } = req.params;
    try {
        await RoleAccess.remove(id);
        response.success(res, 'Role access deleted successfully', 201);
    } catch (err) {
        response.error(res, 'Delete failed', err);
    }
};

const createRoleAccess = async (req, res) => {
    try {
        const result = await RoleAccess.createRoleAccess(req.body); // createMenu = insert record
        response.success(res, 'Role access created successfully', result, 201);
    } catch (err) {
        response.error(res, 'Insert failed', err);
    }
};

module.exports = {
    getAllRoleAccesses,
    getRoleAccessById,
    updateRoleAccess,
    deleteRoleAccess,
    createRoleAccess,
    getAllRoleAccessesPublic
};
