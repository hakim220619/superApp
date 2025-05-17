const Status = require('../models/statusModel'); // Ganti dari usersModel ke statusModel
const response = require('../../../config/helpers/response');

const getAllStatuses = async (req, res) => {
    try {
        const statuses = await Status.findAll();
        response.success(res, 'Statuses fetched successfully', statuses);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const getStatusById = async (req, res) => {
    try {
        const status = await Status.findBy(req.params);
        if (!status) return response.error(res, 'Status not found', status);
        response.success(res, 'Status fetched successfully', status);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const createStatus = async (req, res) => {
    try {
        const result = await Status.createStatus(req.body);
        response.success(res, 'Status created successfully', result, 201);
    } catch (err) {
        response.error(res, 'Insert failed', err);
    }
};

const updateStatus = async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await Status.update(id, req.body);
        response.success(res, 'Status updated successfully', updated, 201);
    } catch (err) {
        response.error(res, 'Update failed', err);
    }
};

const deleteStatus = async (req, res) => {
    const { id } = req.params;
    try {
        await Status.remove(req.db, id);
        response.success(res, 'Status deleted successfully', null, 204);
    } catch (err) {
        response.error(res, 'Delete failed', err);
    }
};

module.exports = {
    getAllStatuses,
    getStatusById,
    createStatus,
    updateStatus,
    deleteStatus
};
