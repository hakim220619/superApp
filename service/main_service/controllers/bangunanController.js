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
        const body = req.body;

        // Map single file fields (jika ada file baru diunggah)
        if (req.files?.foto_depan?.[0]) {
            body.foto_depan = req.files.foto_depan[0].path;
        }
        if (req.files?.foto_sisi_kiri?.[0]) {
            body.foto_sisi_kiri = req.files.foto_sisi_kiri[0].path;
        }
        if (req.files?.foto_sisi_kanan?.[0]) {
            body.foto_sisi_kanan = req.files.foto_sisi_kanan[0].path;
        }

        // Handle array of multiple files (foto_lainnya)
        if (req.files?.foto_lainnya) {
            body.foto_lainnya = req.files.foto_lainnya.map((file) => ({
                path: file.path,
            }));
        }

        // Gabungkan dengan keterangan foto_lainnya jika ada
        if (body['foto_lainnya[]']) {
            const keteranganArray = Array.isArray(body['foto_lainnya[]'])
                ? body['foto_lainnya[]']
                : [body['foto_lainnya[]']];

            if (Array.isArray(body.foto_lainnya)) {
                body.foto_lainnya = body.foto_lainnya.map((item, index) => ({
                    path: item.path,
                    keterangan: keteranganArray[index] || '',
                }));
            }
        }

        // Konversi foto_lainnya ke string JSON (untuk disimpan di DB)
        if (Array.isArray(body.foto_lainnya)) {
            body.foto_lainnya = JSON.stringify(body.foto_lainnya);
        }

        // Update ke DB
        const updated = await Bangunan.update(id, body);

        return response.success(res, 'Data bangunan berhasil diperbarui', updated);
    } catch (err) {
        console.error(err);
        return response.error(res, 'Gagal memperbarui data bangunan', err);
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
        const body = req.body;

        // Map single file fields
        if (req.files?.foto_depan?.[0]) {
            body.foto_depan = req.files.foto_depan[0].path;
        }
        if (req.files?.foto_sisi_kiri?.[0]) {
            body.foto_sisi_kiri = req.files.foto_sisi_kiri[0].path;
        }
        if (req.files?.foto_sisi_kanan?.[0]) {
            body.foto_sisi_kanan = req.files.foto_sisi_kanan[0].path;
        }

        // Handle array of multiple files (foto_lainnya)
        if (req.files?.foto_lainnya) {
            body.foto_lainnya = req.files.foto_lainnya.map((file) => ({
                path: file.path,
            }));
        }

        // Gabungkan dengan keterangan foto_lainnya jika ada
        if (body['foto_lainnya[]']) {
            const keteranganArray = Array.isArray(body['foto_lainnya[]'])
                ? body['foto_lainnya[]']
                : [body['foto_lainnya[]']];

            if (Array.isArray(body.foto_lainnya)) {
                body.foto_lainnya = body.foto_lainnya.map((item, index) => ({
                    path: item.path,
                    keterangan: keteranganArray[index] || '',
                }));
            }
        }

        // Konversi foto_lainnya ke string JSON (untuk disimpan di DB)
        if (Array.isArray(body.foto_lainnya)) {
            body.foto_lainnya = JSON.stringify(body.foto_lainnya);
        }

        // Simpan ke DB
        const result = await Bangunan.createBangunan(body);

        return response.success(res, 'Data bangunan berhasil ditambahkan', result, 201);
    } catch (err) {
        console.error(err);
        return response.error(res, 'Gagal menambahkan data bangunan', err);
    }
};



module.exports = {
    getAllBangunan,
    getBangunanById,
    updateBangunan,
    deleteBangunan,
    createBangunan
};
