const { queryOne, queryAll, queryInsertAndGet, queryExecute } = require('../../../config/helpers/helpers');
const fs = require('fs');
const path = require('path');
const createPembanding = async (data) => {

    const paramsInsert = [
        data.jenis_property,
        data.foto,
        data.sumber_informasi,
        data.kategori_sumber_informasi,
        data.no_hp,
        data.jenis_data,
        data.tgl_penawaran,
        data.harga_penawaran,
        data.diskon,
        data.alamat_aset,
        data.koordinat,
        data.hak_kepemilikan,
        data.luas_tanah,
        data.luas_bangunan,
        data.tahun_dibangun,
        data.tahun_renovasi,
        data.tipe_bangunan,
        data.jumlah_lantai,
        data.kondisi_bangunan,
        data.row_jalan,
        data.perkerasan_jalan,
        data.posisi_aset,
        data.bentuk_tanah,
        data.lebar_muka,
        data.elevansi_terhadap_jalan,
        data.topografi,
        data.orientasi,
        data.peruntukan,
        data.jarak_thd_pusat_kota,
        data.aksesibilitas_n_lokasi,
        data.kondisi_lingkungan,
        data.syarat_pembiayaan,
        data.kondisi_penjualan,
        data.pengeluaran_stlh_pembelian,
        data.kondisi_pasar,
    ];

    const sqlInsert = `
      INSERT INTO properti (
        pembanding, foto, sumber_informasi, kategori_sumber_informasi, no_hp, jenis_data,
        tgl_penawaran, harga_penawaran, diskon, alamat_aset, koordinat, hak_kepemilikan,
        luas_tanah, luas_bangunan, tahun_dibangun, tahun_renovasi, tipe_bangunan,
        jumlah_lantai, kondisi_bangunan, row_jalan, perkerasan_jalan, posisi_aset,
        bentuk_tanah, lebar_muka, elevansi_terhadap_jalan, topografi, orientasi,
        peruntukan, jarak_thd_pusat_kota, aksesibilitas_n_lokasi, kondisi_lingkungan,
        syarat_pembiayaan, kondisi_penjualan, pengeluaran_stlh_pembelian, kondisi_pasar
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
      )
    `;

    const sqlSelect = `SELECT * FROM pembanding WHERE id = LAST_INSERT_ID()`;

    const insertedRow = await queryInsertAndGet(sqlInsert, paramsInsert, sqlSelect);
    return insertedRow;
};




const findAll = async () => {
    const sql = 'SELECT * FROM pembanding ORDER BY id ASC';
    return await queryAll(sql);
};

const findBy = async (id) => {
    const sql = 'SELECT * FROM pembanding WHERE id = ?';
    return await queryOne(sql, [id]);
};
const update = async (id, data) => {
    const fields = [];
    const values = [];

    // Handle penghapusan foto lama jika ada perubahan
    if (data.old_foto && data.foto && data.old_foto !== data.foto) {
        const rootPath = path.resolve(__dirname, '..', '..', '..');
        const filePath = path.join(rootPath, data.old_foto);
        try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (err) {
            console.error('Gagal hapus foto:', err.message);
        }
    }

    for (const key in data) {
        if (key.startsWith('old_')) continue;

        let value = data[key];

        // Handle kolom JSON (jika ada, misalnya koordinat)
        if (key === 'koordinat') {
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

    // Tambahkan updated_at
    fields.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `UPDATE pembanding SET ${fields.join(', ')} WHERE id = ?`;
    const result = await queryExecute(sql, values);
    return { message: 'Pembanding updated', affectedRows: result.affectedRows };
};

const remove = async (id) => {
    const selectSql = 'SELECT foto_depan FROM pembanding WHERE id = ?';
    const [data] = await queryExecute(selectSql, [id]);

     // Hapus file foto jika ada
    if (data && data.foto) {
        const rootPath = path.resolve(__dirname, '..', '..', '..');
        const filePath = path.join(rootPath, data.foto);
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`File ${data.foto} deleted.`);
            } catch (err) {
                console.error('Failed to delete file:', err);
            }
        }
    }

    const deleteSql = 'DELETE FROM pembanding WHERE id = ?';
    const result = await queryExecute(deleteSql, [id]);
    return result.affectedRows;
};

module.exports = {
    createPembanding,
    findAll,
    findBy,
    update,
    remove,
};
