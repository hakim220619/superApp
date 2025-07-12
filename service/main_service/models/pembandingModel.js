const { queryOne, queryAll, queryInsertAndGet, queryExecute } = require('../../../config/helpers/helpers');
const fs = require('fs');
const path = require('path');

const createPembanding = async (data) => {
    // Pastikan `data` memiliki semua field yang sesuai dengan kolom DB Anda
    // dan urutan `paramsInsert` sesuai dengan urutan placeholder di `sqlInsert`.
    const paramsInsert = [
        data.jenis_property,
        data.foto, // Ini sudah JSON string atau null dari controller
        data.sumber_informasi,
        data.kategori_sumber_informasi,
        data.no_hp,
        data.jenis_data,
        data.tgl_penawaran,
        data.harga_penawaran,
        data.diskon,
        data.alamat_aset,
        data.koordinat, // Ini sudah JSON string atau null dari controller
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
        data.status_data // Kolom baru yang diasumsikan ada di DB
    ];

    const sqlInsert = `
      INSERT INTO pembanding ( -- Ganti properti ke pembanding
        jenis_property, foto, sumber_informasi, kategori_sumber_informasi, no_hp, jenis_data,
        tgl_penawaran, harga_penawaran, diskon, alamat_aset, koordinat, hak_kepemilikan,
        luas_tanah, luas_bangunan, tahun_dibangun, tahun_renovasi, tipe_bangunan,
        jumlah_lantai, kondisi_bangunan, row_jalan, perkerasan_jalan, posisi_aset,
        bentuk_tanah, lebar_muka, elevansi_terhadap_jalan, topografi, orientasi,
        peruntukan, jarak_thd_pusat_kota, aksesibilitas_n_lokasi, kondisi_lingkungan,
        syarat_pembiayaan, kondisi_penjualan, pengeluaran_stlh_pembelian, kondisi_pasar, status_data, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
      )
    `;

    // Pastikan `sqlSelect` ini benar dan sesuai dengan tabel `pembanding`
    const sqlSelect = `SELECT * FROM pembanding WHERE id = LAST_INSERT_ID()`;

    const insertedRow = await queryInsertAndGet(sqlInsert, paramsInsert, sqlSelect);
    return insertedRow;
};

const findAll = async () => {
    const sql = 'SELECT * FROM pembanding ORDER BY id ASC'; // Ganti ke tabel `pembanding`
    return await queryAll(sql);
};

const findBy = async (id) => {
    const sql = 'SELECT * FROM pembanding WHERE id = ?'; // Ganti ke tabel `pembanding`
    return await queryOne(sql, [id]);
};

const update = async (id, data) => {
    const fields = [];
    const values = [];

    for (const key in data) {
        if (key === 'id' || key === 'created_at') continue; // Lewati kolom yang tidak perlu diupdate
        
        let value = data[key];

        // Untuk kolom foto dan koordinat, nilai `value` seharusnya sudah dalam format JSON string atau null
        // karena sudah diproses di controller.
        if (value === '' || value === undefined) {
            value = null; // Pastikan kosong diubah ke NULL untuk DB
        }
        
        // Key di `data` yang diterima di sini seharusnya sudah disesuaikan dengan nama kolom DB
        // oleh controller (`dataToUpdate`). Jadi, kita bisa langsung pakai `key`.
        fields.push(`${key} = ?`);
        values.push(value);
    }

    // Tambahkan updated_at
    fields.push(`updated_at = NOW()`);
    values.push(id); // ID adalah parameter terakhir untuk WHERE clause

    const sql = `UPDATE pembanding SET ${fields.join(', ')} WHERE id = ?`; // Ganti ke tabel `pembanding`
    const result = await queryExecute(sql, values);
    return { message: 'Pembanding updated', affectedRows: result.affectedRows };
};

const remove = async (id) => {
    // Ambil info foto sebelum menghapus
    const selectSql = 'SELECT foto FROM pembanding WHERE id = ?'; // Ganti ke tabel `pembanding`
    const [data] = await queryExecute(selectSql, [id]);

    // Hapus file foto jika ada (ini perlu diadaptasi untuk array JSON)
    if (data && data.foto) {
        try {
            const photos = JSON.parse(data.foto);
            const rootPath = path.resolve(__dirname, '..', '..', '..');
            
            if (Array.isArray(photos)) {
                photos.forEach(photo => {
                    const filePath = path.join(rootPath, photo.path); 
                    if (fs.existsSync(filePath)) {
                        try {
                            fs.unlinkSync(filePath);
                            console.log(`File ${photo.path} deleted.`);
                        } catch (err) {
                            console.error(`Failed to delete file ${photo.path}:`, err);
                        }
                    }
                });
            }
        } catch (e) {
            console.error('Failed to parse foto JSON or delete files during remove:', e);
        }
    }

    const deleteSql = 'DELETE FROM pembanding WHERE id = ?'; // Ganti ke tabel `pembanding`
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