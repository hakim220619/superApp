const { queryOne, queryAll, queryInsertAndGet, queryExecute } = require('../../../config/helpers/helpers');

const createSewa = async (data) => {
    const insertSql = `
        INSERT INTO sewa (tanah_id, bangunan_id, pembanding_id, created_at)
        VALUES (?, ?, ?, NOW())
    `;
    const insertParams = [
        JSON.stringify(data.tanah_id),
        JSON.stringify(data.bangunan_id),
        JSON.stringify(data.pembanding_id)
    ];

    const selectSql = `SELECT * FROM sewa WHERE id = ?`;

    const result = await queryInsertAndGet(insertSql, insertParams, selectSql);
    return { data: result };
};

const findAll = async () => {
    return await queryAll('SELECT * FROM sewa ORDER BY id ASC');
};

const getAllSewaAllData = async () => {
    const sql = `
        SELECT * FROM sewa 
        ORDER BY id ASC
    `;
    return await queryAll(sql);
};

const getInformasiUmum = async (id) => {
    const sql = `SELECT * FROM sewa WHERE id = ? ORDER BY id ASC`;
    const sewa = await queryOne(sql, [id]);
    if (!sewa) return [];

    const tanahIdList = sewa.tanah_id || [];
    const bangunanIdList = sewa.bangunan_id || [];
    const pembandingIdList = sewa.pembanding_id || [];

    const objectList = [];

    for (const tid of tanahIdList) {
        const tanah = await queryOne(`SELECT * FROM tanah WHERE id = ?`, [tid]);
        if (tanah) objectList.push(tanah);
    }

    for (const bid of bangunanIdList) {
        const bangunan = await queryOne(`SELECT * FROM bangunan WHERE id = ?`, [bid]);
        if (bangunan) objectList.push(bangunan);
    }

    const pembandingData = [];
    for (const pid of pembandingIdList) {
        const p = await queryOne(`SELECT * FROM pembanding WHERE id = ?`, [pid]);
        if (p) pembandingData.push(p);
    }

    // Peta antara key frontend -> kolom di database pembanding
    const fieldMap = {
        alamat: 'alamat_aset',
        koordinat: 'koordinat',
        sumber_informasi: 'sumber_informasi',
        kategori_sumber_informasi: 'kategori_sumber_informasi',
        nomor_hp: 'no_hp',
        jenis_data: 'jenis_data',
        tgl_penawaran: 'tgl_penawaran',
        jenis_properti: 'jenis_property',
        hak_kepemilikan: 'hak_kepemilikan'
    };

    const labelMap = {
        alamat: 'Alamat',
        koordinat: 'Koordinat',
        sumber_informasi: 'Sumber Informasi',
        kategori_sumber_informasi: 'Kategori Sumber Informasi',
        nomor_hp: 'Nomor HP',
        jenis_data: 'Jenis Data',
        tgl_penawaran: 'Tanggal Penawaran / Transaksi',
        jenis_properti: 'Jenis Properti',
        hak_kepemilikan: 'Hak Kepemilikan'
    };

    const informasiUmumFields = Object.keys(fieldMap).map((key) => {
        const actualKey = fieldMap[key];

        const items = objectList.map((obj) => {
            const item = {
                object: obj?.[actualKey] || '',
            };

            pembandingData.forEach((pb, idx) => {
                item[`pembanding${idx + 1}`] = pb?.[actualKey] || '';
            });

            return item;
        });

        return {
            label: labelMap[key],
            key,
            items,
        };
    });

    return informasiUmumFields;
};


const getDataProperti = async (id) => {
    const sql = `SELECT * FROM sewa WHERE id = ? ORDER BY id ASC`;
    const sewa = await queryOne(sql, [id]);
    if (!sewa) return [];

    const tanahIdList = sewa.tanah_id || [];
    const bangunanIdList = sewa.bangunan_id || [];
    const pembandingIdList = sewa.pembanding_id || [];

    const objectList = [];

    for (const tid of tanahIdList) {
        const tanah = await queryOne(`SELECT * FROM tanah WHERE id = ?`, [tid]);
        if (tanah) objectList.push(tanah);
    }

    for (const bid of bangunanIdList) {
        const bangunan = await queryOne(`SELECT * FROM bangunan WHERE id = ?`, [bid]);
        if (bangunan) objectList.push(bangunan);
    }

    const pembandingData = [];
    for (const pid of pembandingIdList) {
        const p = await queryOne(`SELECT * FROM pembanding WHERE id = ?`, [pid]);
        if (p) pembandingData.push(p);
    }

    const fieldMap = {
        luas_tanah: 'luas_tanah',
        luas_bangunan: 'luas_bangunan',
        tahun_bangun: 'tahun_dibangun',
        tahun_renovasi: 'tahun_renovasi',
        tipe_bangunan_jumlah_lantai: ['tipe_bangunan', 'jumlah_lantai'],
        posisi: 'posisi_aset',
        bentuk: 'bentuk_tanah',
        elevasi: 'elevansi_terhadap_jalan',
        topografi: 'topografi',
        orientasi: 'orientasi',
        perkerasan_jalan: 'perkerasan_jalan',
        lebar_jalan: 'row_jalan',
        lebar_muka: 'lebar_muka',
        peruntukan: 'peruntukan'
    };

    const labelMap = {
        luas_tanah: 'Luas Tanah',
        luas_bangunan: 'Luas Bangunan',
        tahun_bangun: 'Tahun Bangun',
        tahun_renovasi: 'Tahun Renovasi',
        tipe_bangunan_jumlah_lantai: 'Tipe Bangunan / Jumlah Lantai',
        posisi: 'Posisi',
        bentuk: 'Bentuk',
        elevasi: 'Elevasi (meter) terhadap jalan',
        topografi: 'Topografi',
        orientasi: 'Orientasi',
        perkerasan_jalan: 'Perkerasan Jalan',
        lebar_jalan: 'Lebar Jalan',
        lebar_muka: 'Lebar muka',
        peruntukan: 'Peruntukan'
    };

    const informasiPropertiFields = Object.keys(fieldMap).map((key) => {
        const mapVal = fieldMap[key];

        const items = objectList.map((obj) => {
            let objectValue = '';

            if (Array.isArray(mapVal)) {
                const val1 = obj?.[mapVal[0]] || '';
                const val2 = obj?.[mapVal[1]] || '';
                objectValue = `${val1} / ${val2}`;
            } else {
                objectValue = obj?.[mapVal] || '';
            }

            const item = {
                object: objectValue
            };

            pembandingData.forEach((pb, idx) => {
                let pbValue = '';
                if (Array.isArray(mapVal)) {
                    const val1 = pb?.[mapVal[0]] || '';
                    const val2 = pb?.[mapVal[1]] || '';
                    pbValue = `${val1} / ${val2}`;
                } else {
                    pbValue = pb?.[mapVal] || '';
                }

                item[`pembanding${idx + 1}`] = pbValue;
            });

            return item;
        });

        return {
            label: labelMap[key],
            key,
            items,
        };
    });

    return informasiPropertiFields;
};


const getDataUnitPerbandingan = async (id) => {
    const sql = `SELECT * FROM sewa WHERE id = ? ORDER BY id ASC`;
    const sewa = await queryOne(sql, [id]);
    if (!sewa) return [];

    const tanahIdList = sewa.tanah_id || [];
    const bangunanIdList = sewa.bangunan_id || [];
    const pembandingIdList = sewa.pembanding_id || [];

    const objectList = [];

    for (const tid of tanahIdList) {
        const tanah = await queryOne(`SELECT * FROM tanah WHERE id = ?`, [tid]);
        if (tanah) objectList.push(tanah);
    }

    for (const bid of bangunanIdList) {
        const bangunan = await queryOne(`SELECT * FROM bangunan WHERE id = ?`, [bid]);
        if (bangunan) objectList.push(bangunan);
    }

    const pembandingData = [];
    for (const pid of pembandingIdList) {
        const p = await queryOne(`SELECT * FROM pembanding WHERE id = ?`, [pid]);
        if (p) pembandingData.push(p);
    }

    const fieldMap = {
        unit: 'unit',
        mata_uang: 'mata_uang',
        harga_penawaran: 'harga_penawaran',
        diskon: 'diskon',
        indikasi_sewa_sebelum: 'indikasi_sewa_sebelum',
        indikasi_sewa_per_m2: 'indikasi_sewa_per_m2'
    };

    const labelMap = {
        unit: 'Unit',
        mata_uang: 'Mata Uang',
        harga_penawaran: 'Harga Penawaran / Transaksi',
        diskon: 'Diskon',
        indikasi_sewa_sebelum: 'Indikasi Nilai Sewa sebelum penyesuaian',
        indikasi_sewa_per_m2: 'Indikasi Nilai Sewa sebelum penyesuaian / m²'
    };

    const informasiUmumFields = Object.keys(fieldMap).map((key) => {
        const actualKey = fieldMap[key];

        const items = objectList.map((obj) => {
            const item = {
                object: obj?.[actualKey] || '',
            };

            pembandingData.forEach((pb, idx) => {
                item[`pembanding${idx + 1}`] = pb?.[actualKey] || '';
            });

            return item;
        });

        return {
            label: labelMap[key],
            key,
            items,
        };
    });

    return informasiUmumFields;
};





const findBy = async (id) => {
    return await queryOne('SELECT * FROM sewa WHERE id = ?', [id]);
};

const update = async (id, data) => {
    const fields = [];
    const values = [];

    for (const key in data) {
        if (['tanah_id', 'bangunan_id', 'pembanding_id'].includes(key)) {
            fields.push(`${key} = ?`);
            values.push(JSON.stringify(data[key]));
        } else {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
    }

    // Tambahkan updated_at = NOW()
    fields.push('updated_at = NOW()');

    values.push(id); // untuk klausa WHERE
    const sql = `UPDATE sewa SET ${fields.join(', ')} WHERE id = ?`;
    const result = await queryExecute(sql, values);

    return {
        message: 'Data sewa berhasil diperbarui',
        affectedRows: result.affectedRows
    };
};

const remove = async (id) => {
    const sql = `DELETE FROM sewa WHERE id = ?`;
    const result = await queryExecute(sql, [id]);
    return result;
};

module.exports = {
    createSewa,
    findAll,
    getAllSewaAllData,
    getInformasiUmum,
    getDataProperti,
    getDataUnitPerbandingan,
    findBy,
    update,
    remove
};
