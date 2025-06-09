const { queryOne, queryAll, queryInsertAndGet, queryExecute } = require('../../../config/helpers/helpers');
const fs = require('fs');
const path = require('path');
const createTanah = async (data) => {
    // console.log(data.luas_tanah_m2);

    const sqlInsert = `
    INSERT INTO tanah (
      judul_penilaian, nama_entitas, tanggal_inspeksi, tanggal_penilaian, penilai_surveyor,
      foto_foto, batas_utara, batas_selatan, batas_timur, batas_barat, jenis_aset,
      alamat_aset, koordinat, hak_kepemilikan, luas_tanah_m2, row_jalan_m,
      perkerasan_jalan, posisi_aset, bentuk_tanah, lebar_muka_m, elevasi_terhadap_jalan_m,
      topografi, orientasi, peruntukan, jarak_terhadap_pusat_kota,
      aksesibilitas_lokasi, kondisi_lingkungan, kabupaten, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

    const paramsInsert = [
        data.judul_penilaian, data.nama_entitas, data.tanggal_inspeksi, data.tanggal_penilaian, data.penilai_surveyor,
        data.foto_foto, data.batas_utara, data.batas_selatan, data.batas_timur, data.batas_barat, data.jenis_aset,
        data.alamat_aset, data.koordinat, data.hak_kepemilikan, data.luas_tanah_m2, data.row_jalan_m,
        Number(data.perkerasan_jalan), Number(data.posisi_aset), Number(data.bentuk_tanah), data.lebar_muka_m, data.elevasi_terhadap_jalan_m,
        data.topografi, data.orientasi, data.peruntukan, data.jarak_terhadap_pusat_kota,
        data.aksesibilitas_lokasi, data.kondisi_lingkungan, data.kabupaten
    ];

    const sqlSelect = `SELECT * FROM tanah WHERE id = LAST_INSERT_ID()`;

    const row = await queryInsertAndGet(sqlInsert, paramsInsert, sqlSelect);
    // console.log(row);

    return { data: row };
};

const findAll = async () => {
    const sql = 'SELECT * FROM tanah ORDER BY id ASC';
    return await queryAll(sql);
};

const findBy = async (id) => {
    const sql = 'SELECT * FROM tanah WHERE id = ?';
    return await queryOne(sql, [id]);
};


const update = async (id, data) => {
    const fields = [];
    const values = [];

    // Cek dan hapus foto lama jika diganti
    if (data.old_foto_foto && data.foto_foto && data.old_foto_foto !== data.foto_foto) {
        const rootPath = path.resolve(__dirname, '..', '..', '..'); // sesuaikan jika perlu
        const filePath = path.join(rootPath, data.old_foto_foto);

        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('File foto lama dihapus:', filePath);
            } else {
                console.warn('File foto lama tidak ditemukan:', filePath);
            }
        } catch (err) {
            console.error('Gagal menghapus file foto lama:', err.message);
        }
    }

    for (const key in data) {
        if (key === 'old_foto_foto') continue; // jangan update field ini ke DB

        fields.push(`${key} = ?`);

        if (['posisi_aset', 'bentuk_tanah'].includes(key)) {
            values.push(Number(data[key]));
        } else if (['tanggal_inspeksi', 'tanggal_penilaian'].includes(key)) {
            const date = new Date(data[key]);
            const formattedDate = date.toISOString().split('T')[0];
            values.push(formattedDate);
        } else {
            values.push(data[key]);
        }
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `UPDATE tanah SET ${fields.join(', ')} WHERE id = ?`;
    const result = await queryExecute(sql, values);

    return { message: 'Tanah updated', affectedRows: result.affectedRows };
};

const remove = async (id) => {
    const selectSql = 'SELECT foto_foto FROM tanah WHERE id = ?';
    const [data] = await queryExecute(selectSql, [id]);

    if (data && data.foto_foto) {

        const rootPath = path.resolve(__dirname, '..', '..', '..');

        const filePath = path.join(rootPath, data.foto_foto);

        if (fs.existsSync(filePath)) {
            try {

                fs.unlinkSync(filePath);
                console.log(`File ${data.foto_foto} deleted.`);
            } catch (err) {
                console.error('Failed to delete file:', err);
            }
        }
    }

    const deleteSql = 'DELETE FROM tanah WHERE id = ?';
    const result = await queryExecute(deleteSql, [id]);

    return result.affectedRows;
};

module.exports = {
    createTanah,
    findAll,
    findBy,
    update,
    remove,
};
