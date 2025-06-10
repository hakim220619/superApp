const { queryOne, queryAll, queryInsertAndGet, queryExecute } = require('../../../config/helpers/helpers');
const fs = require('fs');
const path = require('path');
const createBangunan = async (data) => {

    const paramsInsert = [
        data.nama_bangunan,
        data.foto_depan,
        data.foto_sisi_kiri === 'null' ? null : data.foto_sisi_kiri,
        data.foto_sisi_kanan === 'null' ? null : data.foto_sisi_kanan,
        data.judul_foto,
        JSON.stringify(data.foto_lainnya || []),
        data.bentuk_bangunan,
        data.grade_gudang,
        data.jumlah_lantai,
        data.basement,
        data.konstruksi_bangunan,
        data.konstruksi_lantai,
        data.konstruksi_dinding,
        data.konstruksi_atap,
        data.konstruksi_pondasi,
        data.versi_btb,
        data.tipe_spek,
        JSON.stringify(data.canvas_data || null),
        data.jenis_bangunan,
        data.jenis_bangunan_detail,
        data.jenis_bangunan_indeks_lantai,
        data.tahun_dibangun,
        data.keterangan_tahun_dibangun,
        data.tahun_renovasi,
        data.keterangan_tahun_direnovasi,
        data.jenis_renovasi,
        data.bobot_renovasi,
        data.kondisi_visual,
        data.catatan_khusus,
        data.luas_bangunan_terpotong,
        data.luas_bangunan_imb,
        data.luas_nama_pintu_jendela,
        data.luas_bobot_pintu_jendela,
        data.luas_nama_dinding,
        data.luas_bobot_dinding,
        data.luas_nama_rangka_atap_datar,
        data.luas_bobot_rangka_atap_datar,
        data.luas_nama_atap_datar,
        data.luas_bobot_atap_datar,
        data.tipe_pondasi_existing,
        data.bobot_tipe_pondasi_existing,
        data.tipe_struktur_existing,
        data.bobot_tipe_struktur_existing,
        data.tipe_rangka_atap_existing,
        data.bobot_rangka_atap_existing,
        data.tipe_penutup_atap_existing,
        data.bobot_penutup_atap_existing,
        data.tipe_tipe_dinding_existing,
        data.bobot_tipe_dinding_existing,
        data.tipe_tipe_pelapis_dinding_existing,
        data.bobot_tipe_pelapis_dinding_existing,
        data.tipe_tipe_pintu_jendela_existing,
        data.bobot_tipe_pintu_jendela_existing,
        data.tipe_tipe_lantai_existing,
        data.bobot_tipe_lantai_existing,
        data.jumlah_lantai_rumah_tinggal,
        data.penggunaan_bangunan,
        JSON.stringify(data.perlengkapan_bangunan || null),

        data.progres_pembangunan,
        data.kondisi_bangunan,
        data.status_data,
    ];

    const sqlInsert = `
      INSERT INTO bangunan (
        nama_bangunan, foto_depan, foto_sisi_kiri, foto_sisi_kanan, judul_foto, foto_lainnya,
        bentuk_bangunan, grade_gudang, jumlah_lantai, basement, konstruksi_bangunan,
        konstruksi_lantai, konstruksi_dinding, konstruksi_atap, konstruksi_pondasi, versi_btb,
        tipe_spek, canvas_data, jenis_bangunan, jenis_bangunan_detail, jenis_bangunan_indeks_lantai,
        tahun_dibangun, keterangan_tahun_dibangun, tahun_renovasi, keterangan_tahun_direnovasi,
        jenis_renovasi, bobot_renovasi, kondisi_visual, catatan_khusus, luas_bangunan_terpotong,
        luas_bangunan_imb, luas_nama_pintu_jendela, luas_bobot_pintu_jendela, luas_nama_dinding,
        luas_bobot_dinding, luas_nama_rangka_atap_datar, luas_bobot_rangka_atap_datar,
        luas_nama_atap_datar, luas_bobot_atap_datar, tipe_pondasi_existing,
        bobot_tipe_pondasi_existing, tipe_struktur_existing, bobot_tipe_struktur_existing,
        tipe_rangka_atap_existing, bobot_rangka_atap_existing, tipe_penutup_atap_existing,
        bobot_penutup_atap_existing, tipe_tipe_dinding_existing, bobot_tipe_dinding_existing,
        tipe_tipe_pelapis_dinding_existing, bobot_tipe_pelapis_dinding_existing,
        tipe_tipe_pintu_jendela_existing, bobot_tipe_pintu_jendela_existing,
        tipe_tipe_lantai_existing, bobot_tipe_lantai_existing, jumlah_lantai_rumah_tinggal,
        penggunaan_bangunan, perlengkapan_bangunan, progres_pembangunan, kondisi_bangunan,
        status_data, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
      )
    `;

    const sqlSelect = `SELECT * FROM bangunan WHERE id = LAST_INSERT_ID()`;

    const insertedRow = await queryInsertAndGet(sqlInsert, paramsInsert, sqlSelect);
    return insertedRow;
};




const findAll = async () => {
    const sql = 'SELECT * FROM bangunan ORDER BY id ASC';
    return await queryAll(sql);
};

const findBy = async (id) => {
    const sql = 'SELECT * FROM bangunan WHERE id = ?';
    return await queryOne(sql, [id]);
};
const update = async (id, data) => {
    const fields = [];
    const values = [];

    if (data.old_foto_depan && data.foto_depan && data.old_foto_depan !== data.foto_depan) {
        const rootPath = path.resolve(__dirname, '..', '..', '..');
        const filePath = path.join(rootPath, data.old_foto_depan);
        try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (err) {
            console.error('Gagal hapus foto depan:', err.message);
        }
    }

    for (const key in data) {
        if (key.startsWith('old_')) continue;

        let value = data[key];

        // Handle JSON column with validation
        if (key === 'canvas_data' || key === 'foto_lainnya') {
            try {
                // Biarkan null jika tidak ada data
                if (value === null || value === undefined || value === '') {
                    value = null;
                } else if (typeof value === 'object') {
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

    const sql = `UPDATE bangunan SET ${fields.join(', ')} WHERE id = ?`;
    const result = await queryExecute(sql, values);
    return { message: 'Bangunan updated', affectedRows: result.affectedRows };
};

const remove = async (id) => {
    const selectSql = 'SELECT foto_depan FROM bangunan WHERE id = ?';
    const [data] = await queryExecute(selectSql, [id]);

    if (data && data.foto_depan) {
        const rootPath = path.resolve(__dirname, '..', '..', '..');
        const filePath = path.join(rootPath, data.foto_depan);
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`File ${data.foto_depan} deleted.`);
            } catch (err) {
                console.error('Failed to delete file:', err);
            }
        }
    }

    const deleteSql = 'DELETE FROM bangunan WHERE id = ?';
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
