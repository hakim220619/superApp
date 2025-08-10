const db = require("../../../config/db");
const {
    queryOne,
    queryAll,
    queryInsertAndGet,
    queryExecute,
} = require("../../../config/helpers/helpers");

const createPasar = async (data) => {
    const insertSql = `
        INSERT INTO pasar (tanah_id, bangunan_id, pembanding_id, created_at)
        VALUES (?, ?, ?, NOW())
    `;
    const insertParams = [
        JSON.stringify(data.tanah_id),
        JSON.stringify(data.bangunan_id),
        JSON.stringify(data.pembanding_id),
    ];

    const selectSql = `SELECT * FROM pasar WHERE id = ?`;

    const result = await queryInsertAndGet(insertSql, insertParams, selectSql);
    return { data: result };
};

const findAll = async () => {
    return await queryAll(`SELECT
    s.id,
    s.created_at,
    s.updated_at,

    (
        SELECT GROUP_CONCAT(name SEPARATOR ', ')
        FROM (
            SELECT t.nama_entitas AS name
            FROM tanah t
            WHERE JSON_CONTAINS(s.tanah_id, CAST(t.id AS JSON), '$')
            UNION ALL
            SELECT b.nama_bangunan AS name
            FROM bangunan b
            WHERE JSON_CONTAINS(s.bangunan_id, CAST(b.id AS JSON), '$')
        ) AS combined_objects
    ) AS object,

    (
        SELECT GROUP_CONCAT(p.jenis_property SEPARATOR ', ')
        FROM pembanding p
        WHERE JSON_CONTAINS(s.pembanding_id, CAST(p.id AS JSON), '$')
    ) AS pembanding

FROM pasar s
ORDER BY s.id ASC
`);
};

const getAllPasarAllData = async () => {
    const sql = `
        SELECT * FROM pasar 
        ORDER BY id ASC
    `;
    return await queryAll(sql);
};

const getInformasiUmum = async (id) => {
    const sql = `SELECT * FROM pasar WHERE id = ? ORDER BY id ASC`;
    const pasar = await queryOne(sql, [id]);
    if (!pasar) return [];

    const tanahIdList = pasar.tanah_id || [];
    const bangunanIdList = pasar.bangunan_id || [];
    const pembandingIdList = pasar.pembanding_id || [];

    const objectList = [];

    for (const tid of tanahIdList) {
        const tanah = await queryOne(`SELECT * FROM tanah WHERE id = ?`, [tid]);
        if (tanah) objectList.push(tanah);
    }

    for (const bid of bangunanIdList) {
        const bangunan = await queryOne(`SELECT * FROM bangunan WHERE id = ?`, [
            bid,
        ]);
        if (bangunan) objectList.push(bangunan);
    }

    const pembandingData = [];
    for (const pid of pembandingIdList) {
        const p = await queryOne(`SELECT * FROM pembanding WHERE id = ?`, [pid]);
        if (p) pembandingData.push(p);
    }

    // Peta antara key frontend -> kolom di database pembanding
    const fieldMap = {
        alamat: "alamat_aset",
        lokasi_dari_objek_penilaian: "lokasi_dari_objek_penilaian",
        koordinat: "koordinat",
        sumber_informasi: "sumber_informasi",
        kategori_sumber_informasi: "kategori_sumber_informasi",
        nomor_hp: "no_hp",
        jenis_data: "jenis_data",
        tgl_penawaran: "tgl_penawaran",
        jenis_properti: "jenis_property",
        hak_kepemilikan: "hak_kepemilikan",
    };

    const labelMap = {
        alamat: "Alamat",
        lokasi_dari_objek_penilaian: "Lokasi dari Objek Penilaian",
        koordinat: "koordinat",
        sumber_informasi: "Sumber Informasi",
        kategori_sumber_informasi: "Kategori Sumber Informasi",
        nomor_hp: "Nomor HP",
        jenis_data: "Jenis Data",
        tgl_penawaran: "Tanggal Penawaran / Transaksi",
        jenis_properti: "Jenis Properti",
        hak_kepemilikan: "Hak Kepemilikan",
    };

    const informasiUmumFields = Object.keys(fieldMap).map((key) => {
        const actualKey = fieldMap[key];

        const items = objectList.map((obj) => {
            const item = {
                object: obj?.[actualKey] || "",
            };

            pembandingData.forEach((pb, idx) => {
                item[`pembanding${idx + 1}`] = pb?.[actualKey] || "";
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

const getDataTransaksiPasar = async (id) => {
    const sql = `SELECT * FROM pasar WHERE id = ? ORDER BY id ASC`;
    const pasar = await queryOne(sql, [id]);
    if (!pasar) return [];

    const tanahIdList = pasar.tanah_id || [];
    const bangunanIdList = pasar.bangunan_id || [];
    const pembandingIdList = pasar.pembanding_id || [];

    const objectList = [];

    for (const tid of tanahIdList) {
        const tanah = await queryOne(`SELECT * FROM tanah WHERE id = ?`, [tid]);
        if (tanah) objectList.push(tanah);
    }

    for (const bid of bangunanIdList) {
        const bangunan = await queryOne(`SELECT * FROM bangunan WHERE id = ?`, [
            bid,
        ]);
        if (bangunan) objectList.push(bangunan);
    }

    const pembandingData = [];
    for (const pid of pembandingIdList) {
        const p = await queryOne(`SELECT * FROM pembanding WHERE id = ?`, [pid]);
        if (p) pembandingData.push(p);
    }

    // Peta antara key frontend -> kolom di database pembanding
    const fieldMap = {
        syarat_pembiayaan: "syarat_pembiayaan",
        kondisi_penjualan: "kondisi_penjualan",
        pengeluaran_setelah_pembelian: "pengeluaran_setelah_pembelian",
        kondisi_pasar: "kondisi_pasar",
    };

    const labelMap = {
        syarat_pembiayaan: "Syarat Pembiayaan",
        kondisi_penjualan: "Kondisi Penjualan",
        pengeluaran_setelah_pembelian: "Pengeluaran Yang Dilakukan Segera Setelah Pembelian",
        kondisi_pasar: "Kondisi Pasar",
    };


    const DataTransaksiPasarFields = Object.keys(fieldMap).map((key) => {
        const actualKey = fieldMap[key];

        const items = objectList.map((obj) => {
            const item = {
                object: obj?.[actualKey] || "",
            };

            pembandingData.forEach((pb, idx) => {
                item[`pembanding${idx + 1}`] = pb?.[actualKey] || "";
            });

            return item;
        });

        return {
            label: labelMap[key],
            key,
            items,
        };
    });


    return DataTransaksiPasarFields;
};

const getPasarById = async (id) => {
    const sql = `SELECT * FROM pasar WHERE id = ? ORDER BY id ASC`;
    const pasar = await queryOne(sql, [id]);
    if (!pasar) return null;
    return pasar;
};

const getTanahByIds = async (tanahIdList) => {
    if (!tanahIdList || tanahIdList.length === 0) return [];
    const placeholders = tanahIdList.map(() => "?").join(",");
    const sql = `SELECT * FROM tanah WHERE id IN (${placeholders})`;
    return await queryAll(sql, tanahIdList);
};

const getPembandingByIds = async (ids) => {
    if (!ids || ids.length === 0) return [];
    const placeholders = ids.map(() => "?").join(",");
    const sql = `SELECT * FROM pembanding WHERE id IN (${placeholders})`;
    return await queryAll(sql, ids);
};

const getOnePembanding = async (id) => {
    if (!id) return null;
    const sql = `SELECT * FROM pembanding WHERE id = ?`;
    return await queryOne(sql, [id]);
};

const getBangunanByIds = async (ids) => {
    if (!ids || ids.length === 0) return [];
    const placeholders = ids.map(() => "?").join(",");
    const sql = `SELECT * FROM bangunan WHERE id IN (${placeholders})`;
    return await queryAll(sql, ids);
};
async function createDefaultElementPerbandingan(pasarId) {
    const label_elemen_perbandingan_penyesuaian_pasar = [
        "Hak Atas Properti yang dialihkan",
        "Syarat Pembiayaan",
        "Kondisi Penjualan",
        "Pengeluaran yang dilakukan segera setelah pembelian",
        "Kondisi Pasar",
        "Perkiraan Harga Transaksi setelah Penyesuaian",
    ];
    try {
        const [pasarRows] = await db.query(
            "SELECT pembanding_id FROM pasar WHERE id = ?",
            [pasarId]
        );

        if (!pasarRows.length) throw new Error("Pasar not found");

        const pembandingIds = pasarRows[0].pembanding_id || [];
        if (!Array.isArray(pembandingIds) || pembandingIds.length === 0) return;

        const [pembandingRows] = await db.query(
            `SELECT id FROM pembanding WHERE id IN (${pembandingIds
                .map(() => "?")
                .join(",")})`,
            pembandingIds
        );

        const insertValues = [];

        for (const pb of pembandingRows) {
            for (const label of label_elemen_perbandingan_penyesuaian_pasar) {
                const [exists] = await db.query(
                    `SELECT 1 
                     FROM elemen_perbandingan_penyesuaian_pasar 
                     WHERE pasar_id = ? AND pembanding_id = ? AND label = ? 
                     LIMIT 1`,
                    [pasarId, pb.id, label]
                );

                if (exists.length === 0) {
                    insertValues.push([pasarId, pb.id, label, 0.0, 0.0]);
                }
            }
        }

        if (insertValues.length > 0) {
            await db.query(
                `INSERT INTO elemen_perbandingan_penyesuaian_pasar 
                 (pasar_id, pembanding_id, label, persen, raw_persen) 
                 VALUES ?`,
                [insertValues]
            );
        }

        return true;
    } catch (error) {
        console.error(
            "Error creating default elemen_perbandingan_penyesuaian_pasar:",
            error
        );
        throw error;
    }
}


const getPersenPenyesuaian = async (id) => {
    try {
        const [penyesuaianRows] = await db.query(
            `SELECT * FROM elemen_perbandingan_penyesuaian_pasar WHERE pasar_id = ?`,
            [id]
        );

        // Convert penyesuaian to a lookup: { [label_pembandingId]: persen }
        const persenLookup = {};
        for (const row of penyesuaianRows) {
            persenLookup[`${row.label}_${row.pembanding_id}`] = {
                persen: parseFloat(row.persen) || 0.0,
                raw_persen: parseFloat(row.raw_persen) || 0.0,
            };
        }
        return persenLookup;
    } catch (error) {
        console.error("Error fetching persen penyesuaian:", error);
    }
};
const LABELS = [
    "Luas Tanah",
    "Luas Bangunan",
    "Bentuk",
    "Elevasi",
    "Topografi",
    "Lebar Muka",
    "Peruntukan",
    "Kondisi Bangunan",
    "Lainnya (sebutkan)",
];

async function createDefaultPersenKarakterFisik(pasarId) {
    try {


        const [pasarRows] = await db.query(
            "SELECT pembanding_id FROM pasar WHERE id = ?",
            [pasarId]
        );
        if (!pasarRows.length) throw new Error("Pasar not found");

        const pembandingIds = pasarRows[0].pembanding_id || [];
        if (!Array.isArray(pembandingIds) || pembandingIds.length === 0) return;

        const [pembandingRows] = await db.query(
            `SELECT id FROM pembanding WHERE id IN (${pembandingIds
                .map(() => "?")
                .join(",")})`,
            pembandingIds
        );

        const insertValues = [];

        for (const pb of pembandingRows) {
            for (const label of LABELS) {
                const [exists] = await db.query(
                    `SELECT 1 FROM karakter_fisik_penyesuaian_pasar WHERE pasar_id = ? AND pembanding_id = ? AND label = ? LIMIT 1`,
                    [pasarId, pb.id, label]
                );

                if (exists.length === 0) {
                    insertValues.push([pasarId, pb.id, label, 0.0, 0.0]);
                }
            }
        }

        if (insertValues.length > 0) {
            await db.query(
                `INSERT INTO karakter_fisik_penyesuaian_pasar (pasar_id, pembanding_id, label, persen, raw_persen) VALUES ?`,
                [insertValues]
            );
        }

        return true;
    } catch (error) {
        console.error("Error creating default karakter_fisik_penyesuaian_pasar:", error);
        throw error;
    }
}

async function loadPersenPenyesuaianFisikFromDB(pasarId) {
    const [rows] = await db.query(
        `SELECT * FROM karakter_fisik_penyesuaian_pasar WHERE pasar_id = ?`,
        [pasarId]
    );

    const persenMap = {};

    for (const row of rows) {
        if (!persenMap[row.label]) {
            persenMap[row.label] = {};
        }
        persenMap[row.label][row.pembanding_id] = {
            persen: parseFloat(row.persen) || 0.0,
            raw_persen: parseFloat(row.raw_persen) || 0.0,
        };
    }
    return persenMap;
}

const getDataProperti = async (id) => {
    const sql = `SELECT * FROM pasar WHERE id = ? ORDER BY id ASC`;
    const pasar = await queryOne(sql, [id]);
    if (!pasar) return [];

    const tanahIdList = pasar.tanah_id || [];
    const bangunanIdList = pasar.bangunan_id || [];
    const pembandingIdList = pasar.pembanding_id || [];

    const objectList = [];

    for (const tid of tanahIdList) {
        const tanah = await queryOne(`SELECT * FROM tanah WHERE id = ?`, [tid]);
        if (tanah) objectList.push(tanah);
    }

    for (const bid of bangunanIdList) {
        const bangunan = await queryOne(`SELECT * FROM bangunan WHERE id = ?`, [
            bid,
        ]);
        if (bangunan) objectList.push(bangunan);
    }

    const pembandingData = [];
    for (const pid of pembandingIdList) {
        const p = await queryOne(`SELECT * FROM pembanding WHERE id = ?`, [pid]);
        if (p) pembandingData.push(p);
    }

    const fieldMap = {
        luas_tanah: "luas_tanah",
        luas_bangunan: "luas_bangunan",
        tahun_bangun: "tahun_dibangun",
        tahun_renovasi: "tahun_renovasi",
        tipe_bangunan_jumlah_lantai: ["tipe_bangunan", "jumlah_lantai"],
        posisi: "posisi_aset",
        bentuk: "bentuk_tanah",
        elevasi: "elevansi_terhadap_jalan",
        topografi: "topografi",
        orientasi: "orientasi",
        perkerasan_jalan: "perkerasan_jalan",
        lebar_jalan: "row_jalan",
        lebar_muka: "lebar_muka",
        peruntukan: "peruntukan",
    };

    const labelMap = {
        luas_tanah: "Luas Tanah",
        luas_bangunan: "Luas Bangunan",
        tahun_bangun: "Tahun Bangun",
        tahun_renovasi: "Tahun Renovasi",
        tipe_bangunan_jumlah_lantai: "Tipe Bangunan / Jumlah Lantai",
        posisi: "Posisi",
        bentuk: "Bentuk",
        elevasi: "Elevasi (meter) terhadap jalan",
        topografi: "Topografi",
        orientasi: "Orientasi",
        perkerasan_jalan: "Perkerasan Jalan",
        lebar_jalan: "Lebar Jalan",
        lebar_muka: "Lebar muka",
        peruntukan: "Peruntukan",
    };

    const informasiPropertiFields = Object.keys(fieldMap).map((key) => {
        const mapVal = fieldMap[key];

        const items = objectList.map((obj) => {
            let objectValue = "";

            if (Array.isArray(mapVal)) {
                const val1 = obj?.[mapVal[0]] || "";
                const val2 = obj?.[mapVal[1]] || "";
                objectValue = `${val1} / ${val2}`;
            } else {
                objectValue = obj?.[mapVal] || "";
            }

            const item = {
                object: objectValue,
            };

            pembandingData.forEach((pb, idx) => {
                let pbValue = "";
                if (Array.isArray(mapVal)) {
                    const val1 = pb?.[mapVal[0]] || "";
                    const val2 = pb?.[mapVal[1]] || "";
                    pbValue = `${val1} / ${val2}`;
                } else {
                    pbValue = pb?.[mapVal] || "";
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

const getDataEstimasiBangunanPasar = async (id) => {
    const sql = `SELECT * FROM pasar WHERE id = ? ORDER BY id ASC`;
    const pasar = await queryOne(sql, [id]);
    if (!pasar) return [];

    const tanahIdList = pasar.tanah_id || [];
    const bangunanIdList = pasar.bangunan_id || [];
    const pembandingIdList = pasar.pembanding_id || [];

    const objectList = [];

    for (const tid of tanahIdList) {
        const tanah = await queryOne(`SELECT * FROM tanah WHERE id = ?`, [tid]);
        if (tanah) objectList.push(tanah);
    }

    for (const bid of bangunanIdList) {
        const bangunan = await queryOne(`SELECT * FROM bangunan WHERE id = ?`, [
            bid,
        ]);
        if (bangunan) objectList.push(bangunan);
    }

    const pembandingData = [];
    for (const pid of pembandingIdList) {
        const p = await queryOne(`SELECT * FROM pembanding WHERE id = ?`, [pid]);
        if (p) pembandingData.push(p);
    }

    const fieldMap = {
        jenis_bangunan: "jenis_bangunan",
        umur_ekonomis: "umur_ekonomis",
        indikasi_biaya_pengganti_baru_per_m2: "indikasi_biaya_pengganti_baru_per_m2",
        indikasi_biaya_pengganti_baru_bangunan: "indikasi_biaya_pengganti_baru_bangunan",
        kondisi_fisik_bangunan_visual: "kondisi_fisik_bangunan_visual",
        keusangan_fungsional: "keusangan_fungsional",
        keusangan_ekonomis: "keusangan_ekonomis",
        // umur_aktual: "umur_aktual",
        // umur_efektif: "umur_efektif",
        // sisa_umur_ekonomis: "sisa_umur_ekonomis",
        // penyusutan_fisik: "penyusutan_fisik",
        // total_penyusutan: "total_penyusutan",
        // estimasi_nilai_pasar_bangunan_per_m2: "estimasi_nilai_pasar_bangunan_per_m2",
        // estimasi_nilai_pasar_bangunan: "estimasi_nilai_pasar_bangunan",
        // estimasi_nilai_pasar_tanah: "estimasi_nilai_pasar_tanah",
        // estimasi_nilai_pasar_tanah_per_m2: "estimasi_nilai_pasar_tanah_per_m2",
    };

    const labelMap = {
        jenis_bangunan: "Jenis Bangunan",
        umur_ekonomis: "Umur Ekonomis",
        indikasi_biaya_pengganti_baru_per_m2: "Indikasi Biaya Pengganti Baru /m2",
        indikasi_biaya_pengganti_baru_bangunan: "Indikasi Biaya Pengganti Baru Bangunan",
        kondisi_fisik_bangunan_visual: "Kondisi Fisik Bangunan (Visual)",
        keusangan_fungsional: "Keusangan Fungsional",
        keusangan_ekonomis: "Keusangan Ekonomis",
        // umur_aktual: "Umur Aktual",
        // umur_efektif: "Umur Efektif",
        // sisa_umur_ekonomis: "Sisa Umur Ekonomis",
        // penyusutan_fisik: "Penyusutan Fisik",
        // total_penyusutan: "Total Penyusutan",
        // estimasi_nilai_pasar_bangunan_per_m2: "Estimasi Nilai Pasar Bangunan per m2",
        // estimasi_nilai_pasar_bangunan: "Estimasi Nilai Pasar Bangunan",
        // estimasi_nilai_pasar_tanah: "Estimasi Nilai Pasar Tanah",
        // estimasi_nilai_pasar_tanah_per_m2: "Estimasi Nilai Pasar Tanah per m2",
    };


    const informasiPropertiFields = Object.keys(fieldMap).map((key) => {
        const mapVal = fieldMap[key];

        const items = objectList.map((obj) => {
            let objectValue = "";

            if (Array.isArray(mapVal)) {
                const val1 = obj?.[mapVal[0]] || "";
                const val2 = obj?.[mapVal[1]] || "";
                objectValue = `${val1} / ${val2}`;
            } else {
                objectValue = obj?.[mapVal] || "";
            }

            const item = {
                object: objectValue,
            };

            pembandingData.forEach((pb, idx) => {
                let pbValue = "";
                if (Array.isArray(mapVal)) {
                    const val1 = pb?.[mapVal[0]] || "";
                    const val2 = pb?.[mapVal[1]] || "";
                    pbValue = `${val1} / ${val2}`;
                } else {
                    pbValue = pb?.[mapVal] || "";
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

const getTotalPersen = async (pasarId) => {
    const [rows] = await db.query(
        `
    SELECT SUM(persen) AS total_persen
    FROM (
      SELECT persen FROM elemen_perbandingan_penyesuaian_pasar WHERE pasar_id = ?
      UNION ALL
      SELECT persen FROM karakter_fisik_penyesuaian_pasar WHERE pasar_id = ?
    ) AS combined
    `,
        [pasarId, pasarId]
    );
    return rows[0].total_persen || 0;
};

const getDataUnitPerbandingan = async (id) => {
    const sql = `SELECT * FROM pasar WHERE id = ? ORDER BY id ASC`;
    const pasar = await queryOne(sql, [id]);
    if (!pasar) return [];

    const tanahIdList = pasar.tanah_id || [];
    const bangunanIdList = pasar.bangunan_id || [];
    const pembandingIdList = pasar.pembanding_id || [];

    const objectList = [];

    for (const tid of tanahIdList) {
        const tanah = await queryOne(`SELECT * FROM tanah WHERE id = ?`, [tid]);
        if (tanah) objectList.push(tanah);
    }

    for (const bid of bangunanIdList) {
        const bangunan = await queryOne(`SELECT * FROM bangunan WHERE id = ?`, [
            bid,
        ]);
        if (bangunan) objectList.push(bangunan);
    }

    const pembandingData = [];
    for (const pid of pembandingIdList) {
        const p = await queryOne(`SELECT * FROM pembanding WHERE id = ?`, [pid]);
        if (p) pembandingData.push(p);
    }

    const fieldMap = {
        unit: "unit",
        mata_uang: "mata_uang",
        harga_penawaran: "harga_penawaran",
        diskon: "diskon",

    };

    const labelMap = {
        unit: "Unit",
        mata_uang: "Mata Uang",
        harga_penawaran: "Harga Penawaran / Transaksi",
        diskon: "Diskon",

    };

    const informasiUmumFields = Object.keys(fieldMap).map((key) => {
        const actualKey = fieldMap[key];

        const items = objectList.map((obj) => {
            const item = {
                object: obj?.[actualKey] || "",
            };

            pembandingData.forEach((pb, idx) => {
                item[`pembanding${idx + 1}`] = pb?.[actualKey] || "";
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
    return await queryOne("SELECT * FROM pasar WHERE id = ?", [id]);
};

const update = async (id, data) => {
    const fields = [];
    const values = [];

    for (const key in data) {
        if (["tanah_id", "bangunan_id", "pembanding_id"].includes(key)) {
            fields.push(`${key} = ?`);
            values.push(JSON.stringify(data[key]));
        } else {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
    }

    // Tambahkan updated_at = NOW()
    fields.push("updated_at = NOW()");

    values.push(id); // untuk klausa WHERE
    const sql = `UPDATE pasar SET ${fields.join(", ")} WHERE id = ?`;
    const result = await queryExecute(sql, values);

    return {
        message: "Data pasar berhasil diperbarui",
        affectedRows: result.affectedRows,
    };
};

const remove = async (id) => {
    const sql = `DELETE FROM pasar WHERE id = ?`;
    const result = await queryExecute(sql, [id]);
    return result;
};

module.exports = {
    createPasar,
    findAll,
    getAllPasarAllData,
    getInformasiUmum,
    getDataTransaksiPasar,
    getDataProperti,
    getDataUnitPerbandingan,
    getDataEstimasiBangunanPasar,
    findBy,
    update,
    remove,
    getBangunanByIds,
    getPembandingByIds,
    getTanahByIds,
    getPasarById,
    getPersenPenyesuaian,
    createDefaultPersenKarakterFisik,
    loadPersenPenyesuaianFisikFromDB,
    createDefaultElementPerbandingan,
    getTotalPersen,
    getOnePembanding,
};
