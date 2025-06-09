const Tanah = require('../models/tanahModel'); // Ganti dengan model Tanah
const response = require('../../../config/helpers/response');

const getAllTanah = async (req, res) => {
    try {
        const tanahList = await Tanah.findAll(req.db);
        response.success(res, 'Data tanah berhasil diambil', tanahList);
    } catch (err) {
        response.error(res, 'Terjadi kesalahan server', err);
    }
};

const getTanahById = async (req, res) => {
    const { id } = req.params;
    try {
        const tanah = await Tanah.findBy(id);
        if (!tanah) return response.error(res, 'Data tanah tidak ditemukan', null, 404);
        response.success(res, 'Data tanah berhasil diambil', tanah);
    } catch (err) {
        response.error(res, 'Terjadi kesalahan server', err);
    }
};

const updateTanah = async (req, res) => {
    const { id } = req.params;
    try {
        if (req.file) {
            req.body.foto_foto = req.file.path;
        }
        const updated = await Tanah.update(id, req.body);
        response.success(res, 'Data tanah berhasil diperbarui', updated, 201);
    } catch (err) {
        response.error(res, 'Gagal memperbarui data', err);
    }
};

const deleteTanah = async (req, res) => {
    const { id } = req.params;
    try {
        await Tanah.remove(id);
        response.success(res, 'Data tanah berhasil dihapus', null, 201);
    } catch (err) {
        response.error(res, 'Gagal menghapus data', err);
    }
};

const createTanah = async (req, res) => {
    try {
        if (req.file) {
            req.body.foto_foto = req.file.path;
        }
        const result = await Tanah.createTanah(req.body);
        response.success(res, 'Data tanah berhasil ditambahkan', result, 201);
    } catch (err) {
        response.error(res, 'Gagal menambahkan data', err);
    }
};

module.exports = {
    getAllTanah,
    getTanahById,
    updateTanah,
    deleteTanah,
    createTanah
};
