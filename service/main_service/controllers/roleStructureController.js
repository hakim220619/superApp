const RoleStructure = require('../models/roleStructureModel');
const response = require('../../../config/helpers/response');

const getAllRoleStructures = async (req, res) => {
    try {
        const roleStructures = await RoleStructure.findAll();
        response.success(res, 'Role structures fetched successfully', roleStructures);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};
const getAllRoleStructuresPublic = async (req, res) => {
    try {
        const roleStructures = await RoleStructure.findAllPublic();

        response.success(res, 'Role structures fetched successfully', roleStructures);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const getRoleStructureById = async (req, res) => {
    const { id } = req.params;
    try {
        const roleStructure = await RoleStructure.findBy(id);
        if (!roleStructure) return response.error(res, 'Role structure not found', null, 404);
        response.success(res, 'Role structure fetched successfully', roleStructure);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const updateRoleStructure = async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await RoleStructure.update(id, req.body);
        response.success(res, 'Role structure updated successfully', updated);
    } catch (err) {
        response.error(res, 'Update failed', err);
    }
};

const deleteRoleStructure = async (req, res) => {
    const { id } = req.params;
    try {
        await RoleStructure.remove(id);
        response.success(res, 'Role structure deleted successfully', 201);
    } catch (err) {
        response.error(res, 'Delete failed', err);
    }
};

const createRoleStructure = async (req, res) => {
    try {
        const result = await RoleStructure.createRoleStructure(req.body); // rename to createRoleStructure if applicable
        response.success(res, 'Role structure created successfully', result, 201);
    } catch (err) {
        response.error(res, 'Insert failed', err);
    }
};

module.exports = {
    getAllRoleStructures,
    getRoleStructureById,
    updateRoleStructure,
    deleteRoleStructure,
    createRoleStructure,
    getAllRoleStructuresPublic
};
