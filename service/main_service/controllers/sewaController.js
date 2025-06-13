const Sewa = require('../models/sewaModel');
const response = require('../../../config/helpers/response');

const getAllSewa = async (req, res) => {
    try {
        const sewaList = await Sewa.findAll();
        response.success(res, 'Data sewa berhasil diambil', sewaList);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const getAllSewaPublic = async (req, res) => {
    try {
        const sewaList = await Sewa.findAllPublic();
        response.success(res, 'Data sewa publik berhasil diambil', sewaList);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const getSewaById = async (req, res) => {
    const { id } = req.params;
    try {
        const sewa = await Sewa.findBy(id);
        if (!sewa) return response.error(res, 'Data sewa tidak ditemukan', null, 404);
        response.success(res, 'Data sewa berhasil diambil', sewa);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const updateSewa = async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await Sewa.update(id, req.body);
        response.success(res, 'Data sewa berhasil diperbarui', updated);
    } catch (err) {
        response.error(res, 'Gagal memperbarui data sewa', err);
    }
};

const deleteSewa = async (req, res) => {
    const { id } = req.params;
    try {
        await Sewa.remove(id);
        response.success(res, 'Data sewa berhasil dihapus', 201);
    } catch (err) {
        response.error(res, 'Gagal menghapus data sewa', err);
    }
};

const createSewa = async (req, res) => {
    try {
        const result = await Sewa.createSewa(req.body); // Pastikan method-nya bernama createSewa
        response.success(res, 'Data sewa berhasil dibuat', result, 201);
    } catch (err) {
        response.error(res, 'Gagal membuat data sewa', err);
    }
};

module.exports = {
    getAllSewa,
    getAllSewaPublic,
    getSewaById,
    updateSewa,
    deleteSewa,
    createSewa
};
