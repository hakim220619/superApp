const Bangunan = require('../models/bangunanModel'); // Ganti dengan model baru
const response = require('../../../config/helpers/response');

const getAllBangunan = async (req, res) => {
    try {
        const bangunan = await Bangunan.findAll(req.db);
        response.success(res, 'Data bangunan berhasil diambil', bangunan);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const getBangunanById = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await Bangunan.findBy(id);
        if (!data) return response.error(res, 'Data bangunan tidak ditemukan', null, 404);
        response.success(res, 'Data bangunan berhasil diambil', data);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const updateBangunan = async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await Bangunan.update(id, req.body);
        response.success(res, 'Data bangunan berhasil diperbarui', updated);
    } catch (err) {
        response.error(res, 'Gagal memperbarui data bangunan', err);
    }
};

const deleteBangunan = async (req, res) => {
    const { id } = req.params;
    try {
        await Bangunan.remove(id);
        response.success(res, 'Data bangunan berhasil dihapus', null, 201);
    } catch (err) {
        response.error(res, 'Gagal menghapus data bangunan', err);
    }
};

const createBangunan = async (req, res) => {
    try {
        const result = await Bangunan.create(req.body); // diasumsikan method-nya `create`, bukan `createMenu`
        response.success(res, 'Data bangunan berhasil ditambahkan', result, 201);
    } catch (err) {
        response.error(res, 'Gagal menambahkan data bangunan', err);
    }
};

module.exports = {
    getAllBangunan,
    getBangunanById,
    updateBangunan,
    deleteBangunan,
    createBangunan
};
