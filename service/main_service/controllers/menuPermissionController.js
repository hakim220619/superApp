const MenuPermission = require('../models/menuPermissionModel');
const response = require('../../../config/helpers/response');

const getAllMenuPermissions = async (req, res) => {
    try {
        const permissions = await MenuPermission.findAll(req.db);
        response.success(res, 'Menu permissions fetched successfully', permissions);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const getMenuPermissionById = async (req, res) => {
    const { id } = req.params;
    try {
        const permission = await MenuPermission.findBy(id);
        if (!permission) return response.error(res, 'Menu permission not found', null, 404);
        response.success(res, 'Menu permission fetched successfully', permission);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const getMenuPermissionDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const permission = await MenuPermission.findByDetail(id);
        if (!permission) return response.error(res, 'Menu permission not found', null, 404);
        response.success(res, 'Menu permission fetched successfully', permission);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const updateMenuPermission = async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await MenuPermission.update(id, req.body);
        response.success(res, 'Menu permission updated successfully', updated);
    } catch (err) {
        response.error(res, 'Update failed', err);
    }
};

const deleteMenuPermission = async (req, res) => {
    const { id } = req.params;
    try {
        await MenuPermission.remove(id);
        response.success(res, 'Menu permission deleted successfully', null, 201);
    } catch (err) {
        response.error(res, 'Delete failed', err);
    }
};

const createMenuPermission = async (req, res) => {
    try {
        const result = await MenuPermission.createMenuPermission(req.body);
        response.success(res, 'Menu permission created successfully', result, 201);
    } catch (err) {
        response.error(res, 'Insert failed', err);
    }
};

module.exports = {
    getAllMenuPermissions,
    getMenuPermissionById,
    getMenuPermissionDetail,
    updateMenuPermission,
    deleteMenuPermission,
    createMenuPermission
};
