const Pasar = require("../models/pasarModel");
const response = require("../../../config/helpers/response");
const {
    findPasarReport,
    updatePenyesuaianKarakterFisikByPasarId,
    updatePenyesuaianElemenPerbandingByPasarId,
} = require("../../../domain/pasar");
const db = require("../../../config/db");
const rupiah = require("../../core/rupiah");

const getAllPasar = async (req, res) => {
    try {
        const pasarList = await Pasar.findAll();
        response.success(res, "Data pasar berhasil diambil", pasarList);
    } catch (err) {
        response.error(res, "Server error", err);
    }
};

const getAllPasarAllData = async (req, res) => {
    try {
        const pasarList = await Pasar.getAllPasarAllData();
        response.success(res, "Data pasar publik berhasil diambil", pasarList);
    } catch (err) {
        response.error(res, "Server error", err);
    }
};

const getInformasiUmum = async (req, res) => {
    try {
        const { id } = req.params;

        const pasarList = await Pasar.getInformasiUmum(id);
        response.success(res, "Data pasar publik berhasil diambil", pasarList);
    } catch (err) {
        response.error(res, "Server error", err);
    }
};

const getDataTransaksiPasar = async (req, res) => {
    try {
        const { id } = req.params;

        const pasarList = await Pasar.getDataTransaksiPasar(id);
        response.success(res, "Data pasar publik berhasil diambil", pasarList);
    } catch (err) {
        response.error(res, "Server error", err);
    }
};

const getDataProperti = async (req, res) => {
    try {
        const { id } = req.params;

        const pasarList = await Pasar.getDataProperti(id);
        response.success(res, "Data pasar publik berhasil diambil", pasarList);
    } catch (err) {
        response.error(res, "Server error", err);
    }
};
const getDataEstimasiBangunanPasar = async (req, res) => {
    try {
        const { id } = req.params;
        let { tahun } = req.query;

        // pastikan tahun selalu array
        if (tahun) {
            if (!Array.isArray(tahun)) {
                tahun = [tahun]; // kalau string, ubah ke array
            }
        } else {
            tahun = [];
        }


        const pasarList = await Pasar.getDataEstimasiBangunanPasar(id, tahun);
        response.success(res, "Data pasar publik berhasil diambil", pasarList);
    } catch (err) {
        response.error(res, "Server error", err);
    }
};


const getDataUnitPerbandingan = async (req, res) => {
    try {
        const { id } = req.params;

        const pasarList = await Pasar.getDataUnitPerbandingan(id);
        response.success(res, "Data pasar publik berhasil diambil", pasarList);
    } catch (err) {
        response.error(res, "Server error", err);
    }
};

const getPasarById = async (req, res) => {
    const { id } = req.params;
    try {
        // const pasar = await Pasar.findBy(id);
        const pasar = await findPasarReport(id);
        if (!pasar)
            return response.error(res, "Data pasar tidak ditemukan", null, 404);
        response.success(res, "Data pasar berhasil diambil", pasar);
    } catch (err) {
        console.log(err);
        response.error(res, "Server error", err);
    }
};

const updatePasar = async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await Pasar.update(id, req.body);
        response.success(res, "Data pasar berhasil diperbarui", updated);
    } catch (err) {
        response.error(res, "Gagal memperbarui data pasar", err);
    }
};

const deletePasar = async (req, res) => {
    const { id } = req.params;
    try {
        await Pasar.remove(id);
        response.success(res, "Data pasar berhasil dihapus", 201);
    } catch (err) {
        response.error(res, "Gagal menghapus data pasar", err);
    }
};

const createPasar = async (req, res) => {
    try {
        const result = await Pasar.createPasar(req.body); // Pastikan method-nya bernama createPasar
        response.success(res, "Data pasar berhasil dibuat", result, 201);
    } catch (err) {
        response.error(res, "Gagal membuat data pasar", err);
    }
};

const findElemenPerbandingan = async (req, res) => {
    const { pasarId } = req.params;

    try {
        const [pasarRows] = await db.query("SELECT * FROM pasar WHERE id = ?", [
            pasarId,
        ]);
        if (!pasarRows.length)
            return res.status(404).json({ message: "Data pasar not found" });

        const pasar = pasarRows[0];

        const tanahIds = pasar.tanah_id || [];
        const bangunanIds = pasar.bangunan_id || [];
        const pembandingIds = pasar.pembanding_id || [];

        const [pembandingRows] = await db.query(
            `SELECT * FROM pembanding WHERE id IN (?)`,
            [pembandingIds]
        );

        const [tanahRows] = tanahIds.length
            ? await db.query(`SELECT * FROM tanah WHERE id IN (?)`, [tanahIds])
            : [[]];

        const [bangunanRows] = bangunanIds.length
            ? await db.query(`SELECT * FROM bangunan WHERE id IN (?)`, [bangunanIds])
            : [[]];

        const objectTanah = tanahRows.map((t) => ({
            keterangan: "Jarak dari pusat kota",
            deskripsi: `${t.jarak_terhadap_pusat_kota || "-"}`,
        }));

        const objectBangunan = bangunanRows.map((b) => ({
            keterangan: "Kondisi visual bangunan",
            deskripsi: `${b.konstruksi_bangunan || "-"}`,
        }));

        const elemen_perbandingan = [
            {
                kategori: "Faktor Fisik",
                items: [
                    {
                        label: "Jarak terhadap pusat kota",
                        objects: objectTanah,
                        pembanding: pembandingRows.map((pb) => ({
                            deskripsi: `${pb.jarak_thd_pusat_kota} km` || "-",
                            persen: "0.00%",
                            penyesuaian: rupiah(0),
                        })),
                    },
                    {
                        label: "Perkerasan Jalan/Lebar Jalan",
                        objects: objectTanah.map((t) => ({
                            keterangan: "Jalan depan aset",
                            deskripsi: `${t.perkerasan_jalan || "-"} / ${t.row_jalan_m || "-"}`,
                        })),
                        pembanding: pembandingRows.map((pb) => ({
                            deskripsi: `${pb.perkerasan_jalan} / ${pb.row_jalan}`,
                            persen: "0.00%",
                            penyesuaian: rupiah(0),
                        })),
                    },
                    {
                        label: "Kondisi Lingkungan",
                        objects:
                            objectBangunan.length != 0
                                ? objectBangunan
                                : [
                                    {
                                        keterangan: "Gambaran atas kondisi spesifik",
                                        deskripsi: "-",
                                    },
                                ],
                        pembanding: pembandingRows.map((pb) => ({
                            deskripsi: pb.kondisi_bangunan || "-",
                            persen: "0.00%",
                            penyesuaian: rupiah(0),
                        })),
                    },
                    {
                        label: "Posisi Aset",
                        objects:
                            objectBangunan.length != 0
                                ? objectBangunan
                                : [
                                    {
                                        keterangan: "Posisi atau Letak Objek terhadap akses jalan",
                                        deskripsi: "-",
                                    },
                                ],
                        pembanding: pembandingRows.map((pb) => ({
                            deskripsi: pb.kondisi_bangunan || "-",
                            persen: "0.00%",
                            penyesuaian: rupiah(0),
                        })),
                    },
                    {
                        label: "Lainnya (sebutkan)",
                        objects:
                            objectBangunan.length != 0
                                ? objectBangunan
                                : [
                                    {
                                        keterangan: "-",
                                        deskripsi: "-",
                                    },
                                ],
                        pembanding: pembandingRows.map((pb) => ({
                            deskripsi: "-",
                            persen: "0.00%",
                            penyesuaian: rupiah(0),
                        })),
                    },
                    {
                        label: "Perkiraan Harga Transaksi setelah Penyesuaian",
                        objects:
                            objectBangunan.length != 0
                                ? objectBangunan
                                : [
                                    {
                                        keterangan: "Estimasi harga setelah faktor penyesuaian",
                                        deskripsi: "-",
                                    },
                                ],
                        pembanding: pembandingRows.map((pb) => ({
                            deskripsi: pb.perkiraan_harga_transaksi_setelah_penyesuaian
                                ? rupiah(pb.perkiraan_harga_transaksi_setelah_penyesuaian)
                                : "-",
                            persen: "0.00%",
                            penyesuaian: rupiah(0),
                        })),
                    },
                ],
            },
        ];


        return res.json(elemen_perbandingan);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const updatePenyesuaianKarakterFisik = async (req, res) => {
    const { pasarId } = req.params;
    const { raw_persen, label, pembanding_id } = req.body;
    try {
        await updatePenyesuaianKarakterFisikByPasarId(pasarId, {
            raw_persen,
            label,
            pembanding_id,
        });
        return res
            .status(200)
            .json({ message: "Penyesuaian updated successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
const updatePenyesuaianElemenPerbandingan = async (req, res) => {
    const { pasarId } = req.params;
    const { raw_persen, label, pembanding_id } = req.body;
    try {
        await updatePenyesuaianElemenPerbandingByPasarId(pasarId, {
            raw_persen,
            label,
            pembanding_id,
        });
        return res
            .status(200)
            .json({ message: "Penyesuaian updated successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    getAllPasar,
    getAllPasarAllData,
    getInformasiUmum,
    getDataTransaksiPasar,
    getDataProperti,
    getDataUnitPerbandingan,
    getDataEstimasiBangunanPasar,
    getPasarById,
    updatePasar,
    deletePasar,
    createPasar,
    findElemenPerbandingan,
    updatePenyesuaianKarakterFisik,
    updatePenyesuaianElemenPerbandingan,
};

// =((E64-$D$64)/$D$64)*$N$64
