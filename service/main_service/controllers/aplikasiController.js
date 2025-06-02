const Aplikasi = require('../models/aplikasiModel'); // Ganti dari statusModel ke aplikasiModel
const response = require('../../../config/helpers/response');

const getAllAplikasies = async (req, res) => {
    try {
        const aplikasies = await Aplikasi.findAll();
        response.success(res, 'Aplikasi list fetched successfully', aplikasies);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const getAplikasiById = async (req, res) => {
    try {
        const aplikasi = await Aplikasi.findBy(req.params);
        if (!aplikasi) return response.error(res, 'Aplikasi not found', aplikasi);
        response.success(res, 'Aplikasi fetched successfully', aplikasi);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const createAplikasi = async (req, res) => {
    try {
        const result = await Aplikasi.createAplikasi(req.body);
        response.success(res, 'Aplikasi created successfully', result, 201);
    } catch (err) {
        response.error(res, 'Insert failed', err);
    }
};

const updateAplikasi = async (req, res) => {
    const { id } = req.params;

    if (req.file) {
        req.body.logo = req.file.path;
    }

    try {
        const updated = await Aplikasi.update(id, req.body);

        response.success(res, 'Aplikasi updated successfully', updated);

    } catch (err) {
        response.error(res, 'Update failed', err);
    }
};

const deleteAplikasi = async (req, res) => {
    const { id } = req.params;
    try {
        await Aplikasi.remove(req.db, id);
        response.success(res, 'Aplikasi deleted successfully', null, 204);
    } catch (err) {
        response.error(res, 'Delete failed', err);
    }
};

module.exports = {
    getAllAplikasies,
    getAplikasiById,
    createAplikasi,
    updateAplikasi,
    deleteAplikasi
};
