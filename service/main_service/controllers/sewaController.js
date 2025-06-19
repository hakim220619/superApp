const Sewa = require("../models/sewaModel");
const response = require("../../../config/helpers/response");
const { findSewaReport } = require("../../../domain/sewa");
const db = require("../../../config/db");
const rupiah = require("../../core/rupiah");

const getAllSewa = async (req, res) => {
  try {
    const sewaList = await Sewa.findAll();
    response.success(res, "Data sewa berhasil diambil", sewaList);
  } catch (err) {
    response.error(res, "Server error", err);
  }
};

const getAllSewaAllData = async (req, res) => {
  try {
    const sewaList = await Sewa.getAllSewaAllData();
    response.success(res, "Data sewa publik berhasil diambil", sewaList);
  } catch (err) {
    response.error(res, "Server error", err);
  }
};

const getInformasiUmum = async (req, res) => {
  try {
    const { id } = req.params;

    const sewaList = await Sewa.getInformasiUmum(id);
    response.success(res, "Data sewa publik berhasil diambil", sewaList);
  } catch (err) {
    response.error(res, "Server error", err);
  }
};

const getDataProperti = async (req, res) => {
  try {
    const { id } = req.params;

    const sewaList = await Sewa.getDataProperti(id);
    response.success(res, "Data sewa publik berhasil diambil", sewaList);
  } catch (err) {
    response.error(res, "Server error", err);
  }
};

const getDataUnitPerbandingan = async (req, res) => {
  try {
    const { id } = req.params;

    const sewaList = await Sewa.getDataUnitPerbandingan(id);
    response.success(res, "Data sewa publik berhasil diambil", sewaList);
  } catch (err) {
    response.error(res, "Server error", err);
  }
};

const getSewaById = async (req, res) => {
  const { id } = req.params;
  try {
    // const sewa = await Sewa.findBy(id);
    const sewa = await findSewaReport(id);
    if (!sewa)
      return response.error(res, "Data sewa tidak ditemukan", null, 404);
    response.success(res, "Data sewa berhasil diambil", sewa);
  } catch (err) {
    console.log(err);
    response.error(res, "Server error", err);
  }
};

const updateSewa = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Sewa.update(id, req.body);
    response.success(res, "Data sewa berhasil diperbarui", updated);
  } catch (err) {
    response.error(res, "Gagal memperbarui data sewa", err);
  }
};

const deleteSewa = async (req, res) => {
  const { id } = req.params;
  try {
    await Sewa.remove(id);
    response.success(res, "Data sewa berhasil dihapus", 201);
  } catch (err) {
    response.error(res, "Gagal menghapus data sewa", err);
  }
};

const createSewa = async (req, res) => {
  try {
    const result = await Sewa.createSewa(req.body); // Pastikan method-nya bernama createSewa
    response.success(res, "Data sewa berhasil dibuat", result, 201);
  } catch (err) {
    response.error(res, "Gagal membuat data sewa", err);
  }
};

const findElemenPerbandingan = async (req, res) => {
  const { sewaId } = req.params;

  try {
    const [sewaRows] = await db.query("SELECT * FROM sewa WHERE id = ?", [
      sewaId,
    ]);
    if (!sewaRows.length)
      return res.status(404).json({ message: "Data sewa not found" });

    const sewa = sewaRows[0];

    const tanahIds = sewa.tanah_id || [];
    const bangunanIds = sewa.bangunan_id || [];
    const pembandingIds = sewa.pembanding_id || [];

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
              deskripsi: `${t.perkerasan_jalan || "-"} / ${
                t.row_jalan_m || "-"
              }`,
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
                      keterangan:
                        "Posisi atau Letak Objek terhadap akses jalan",
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
        ],
      },
    ];

    return res.json(elemen_perbandingan);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = {
  getAllSewa,
  getAllSewaAllData,
  getInformasiUmum,
  getDataProperti,
  getDataUnitPerbandingan,
  getSewaById,
  updateSewa,
  deleteSewa,
  createSewa,
  findElemenPerbandingan,
};
