const {
  queryOne,
  queryAll,
  queryInsertAndGet,
  queryExecute,
} = require("../../../config/helpers/helpers");
const fs = require("fs");
const path = require("path");
const createBangunan = async (data) => {
  const paramsInsert = [
        data.judul_penilaian, data.nama_entitas, data.tanggal_inspeksi, data.tanggal_penilaian, data.penilai_surveyor,
        data.foto_foto, data.batas_utara, data.batas_selatan, data.batas_timur, data.batas_barat, data.jenis_aset,
        data.alamat_aset, data.koordinat, data.hak_kepemilikan, data.luas_tanah_m2, data.luas_bangunan_m2, data.row_jalan_m,
        Number(data.perkerasan_jalan), Number(data.posisi_aset), Number(data.bentuk_tanah), data.lebar_muka_m, data.elevasi_terhadap_jalan_m,
        data.topografi, data.orientasi, data.peruntukan, data.jarak_terhadap_pusat_kota,
        data.aksesibilitas_lokasi, data.kondisi_lingkungan, data.kabupaten, data.tipe_bangunan, data.jumlah_lantai, data.tahun_dibangun, data.tahun_renovasi, data.kondisi_bangunan
    ];

  const sqlInsert = `
    INSERT INTO object (
      judul_penilaian, nama_entitas, tanggal_inspeksi, tanggal_penilaian, penilai_surveyor,
      foto_foto, batas_utara, batas_selatan, batas_timur, batas_barat, jenis_aset,
      alamat_aset, koordinat, hak_kepemilikan, luas_tanah_m2,luas_bangunan_m2, row_jalan_m,
      perkerasan_jalan, posisi_aset, bentuk_tanah, lebar_muka_m, elevasi_terhadap_jalan_m,
      topografi, orientasi, peruntukan, jarak_terhadap_pusat_kota,
      aksesibilitas_lokasi, kondisi_lingkungan, kabupaten, created_at, object_type_id, tipe_bangunan, jumlah_lantai, tahun_dibangun, tahun_renovasi, kondisi_bangunan
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 2, ?, ?, ?, ?, ?)
  `;

  const sqlSelect = `SELECT * FROM object WHERE id = LAST_INSERT_ID()`;

  const insertedRow = await queryInsertAndGet(
    sqlInsert,
    paramsInsert,
    sqlSelect
  );
  return insertedRow;
};

const findAll = async () => {
  const sql = "SELECT * FROM object ORDER BY id ASC";
  return await queryAll(sql);
};

const findBy = async (id) => {
  const sql = "SELECT * FROM object WHERE id = ?";
  return await queryOne(sql, [id]);
};
const update = async (id, data) => {
  const fields = [];
  const values = [];

  if (
    data.old_foto_depan &&
    data.foto_depan &&
    data.old_foto_depan !== data.foto_depan
  ) {
    const rootPath = path.resolve(__dirname, "..", "..", "..");
    const filePath = path.join(rootPath, data.old_foto_depan);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Gagal hapus foto depan:", err.message);
    }
  }

  for (const key in data) {
    if (key.startsWith("old_")) continue;

    let value = data[key];

    // Handle JSON column with validation
    if (key === "canvas_data" || key === "foto_lainnya") {
      try {
        // Biarkan null jika tidak ada data
        if (value === null || value === undefined || value === "") {
          value = null;
        } else if (typeof value === "object") {
          value = JSON.stringify(value);
        } else {
          // Validasi string JSON
          JSON.parse(value);
        }
      } catch (e) {
        console.warn(`Invalid JSON for ${key}, setting to NULL`);
        value = null;
      }
    }

    fields.push(`${key} = ?`);
    values.push(value);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const sql = `UPDATE object SET ${fields.join(", ")} WHERE id = ?`;
  const result = await queryExecute(sql, values);
  return { message: "Bangunan updated", affectedRows: result.affectedRows };
};

const remove = async (id) => {
  const selectSql = "SELECT foto_depan FROM object WHERE id = ?";
  const [data] = await queryExecute(selectSql, [id]);

  if (data && data.foto_depan) {
    const rootPath = path.resolve(__dirname, "..", "..", "..");
    const filePath = path.join(rootPath, data.foto_depan);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`File ${data.foto_depan} deleted.`);
      } catch (err) {
        console.error("Failed to delete file:", err);
      }
    }
  }

  const deleteSql = "DELETE FROM object WHERE id = ?";
  const result = await queryExecute(deleteSql, [id]);
  return result.affectedRows;
};

module.exports = {
  createBangunan,
  findAll,
  findBy,
  update,
  remove,
};
