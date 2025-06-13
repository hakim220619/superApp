const Pembanding = require('../models/pembandingModel'); // Ganti dengan model baru
const response = require('../../../config/helpers/response');

const getAllPembanding = async (req, res) => {
    try {
        const pembanding = await Pembanding.findAll(req.db);
        response.success(res, 'Data pembanding berhasil diambil', pembanding);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const getPembandingById = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await Pembanding.findBy(id);
        if (!data) return response.error(res, 'Data pembanding tidak ditemukan', null, 404);
        response.success(res, 'Data pembanding berhasil diambil', data);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const updatePembanding = async (req, res) => {
    const { id } = req.params;

    try {
        const body = req.body;

        // Map single file field untuk foto
        if (req.files?.foto?.[0]) {
            body.foto = req.files.foto[0].path;
        }

        // Update ke DB
        const updated = await Pembanding.update(id, body);

        return response.success(res, 'Data pembanding berhasil diperbarui', updated);
    } catch (err) {
        console.error(err);
        return response.error(res, 'Gagal memperbarui data pembanding', err);
    }
};


const deletePembanding = async (req, res) => {
    const { id } = req.params;
    try {
        await Pembanding.remove(id);
        response.success(res, 'Data pembanding berhasil dihapus', null, 201);
    } catch (err) {
        response.error(res, 'Gagal menghapus data pembanding', err);
    }
};

const createPembanding = async (req, res) => {
    try {
        const body = req.body;

        // Map single file field untuk foto
        if (req.files?.foto?.[0]) {
            body.foto = req.files.foto[0].path;
        }

        // Konversi koordinat ke string JSON jika berupa objek
        if (body.koordinat && typeof body.koordinat === 'object') {
            body.koordinat = JSON.stringify(body.koordinat);
        }

        // Simpan ke DB
        const result = await Pembanding.createPembanding(body);

        return response.success(res, 'Data pembanding berhasil ditambahkan', result, 201);
    } catch (err) {
        console.error(err);
        return response.error(res, 'Gagal menambahkan data pembanding', err);
    }
};



module.exports = {
    getAllPembanding,
    getPembandingById,
    updatePembanding,
    deletePembanding,
    createPembanding
};
