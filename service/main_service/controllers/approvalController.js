const Approval = require('../models/approvalModel');
const response = require('../../../config/helpers/response');

// ✅ GET all approvals
const getAllApprovals = async (req, res) => {
    try {
        const approvals = await Approval.findAll();
        response.success(res, 'Approvals fetched successfully', approvals);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const approvalActive = async (req, res) => {
    try {
        const { source_id, type } = req.params;
        const approvals = await Approval.approvalActive({ source_id, type });

        return response.success(res, 'Approvals fetched successfully', approvals);
    } catch (err) {

        console.error('❌ Error in approvalActive:', err);
        return response.error(res, 'Server error', err);
    }
};


// ✅ GET approval by ID
const getApprovalById = async (req, res) => {
    const { id } = req.params;
    try {
        const approval = await Approval.findById(id);
        if (!approval) return response.error(res, 'Approval not found', null, 404);
        response.success(res, 'Approval fetched successfully', approval);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

// ✅ CREATE new approval (insert ke list_approval)
const createApproval = async (req, res) => {
    try {
        const result = await Approval.create(req.body);
        response.success(res, 'Approval created successfully', result, 201);
    } catch (err) {
        response.error(res, 'Insert failed', err);
    }
};


const generateApproval = async (req, res) => {
    try {
        const result = await Approval.generateApproval(req.body);
        response.success(res, 'Approval created successfully', result, 201);
    } catch (err) {
        response.error(res, 'Insert failed', err);
    }
};

// ✅ UPDATE approval
const updateApproval = async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await Approval.update(id, req.body);
        response.success(res, 'Approval updated successfully', updated);
    } catch (err) {
        response.error(res, 'Update failed', err);
    }
};

const approvalUpdate = async (req, res) => {
    try {
        const updated = await Approval.approvalUpdate(req.body);
        response.success(res, 'Approval updated successfully', updated);
    } catch (err) {
        response.error(res, 'Update failed', err);
    }
};

// ✅ DELETE approval
const deleteApproval = async (req, res) => {
    const { id } = req.params;
    try {
        await Approval.remove(id);
        response.success(res, 'Approval deleted successfully', null, 201);
    } catch (err) {
        response.error(res, 'Delete failed', err);
    }
};

module.exports = {
    getAllApprovals,
    getApprovalById,
    createApproval,
    updateApproval,
    deleteApproval,
    generateApproval,
    approvalActive,
    approvalUpdate
};
