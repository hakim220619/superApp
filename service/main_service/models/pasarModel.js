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
            SELECT CONCAT(t.id, ' - ', t.judul_penilaian, ' (Tanah)') AS name
            FROM tanah t
            WHERE JSON_CONTAINS(s.tanah_id, CAST(t.id AS JSON), '$')
            UNION ALL
            SELECT CONCAT(b.id, ' - ', b.nama_bangunan, ' (Bangunan)') AS name
            FROM bangunan b
            WHERE JSON_CONTAINS(s.bangunan_id, CAST(b.id AS JSON), '$')
        ) AS combined_objects
    ) AS object,

    (
        SELECT GROUP_CONCAT(CONCAT(p.id, ' - ', p.jenis_property) SEPARATOR ', ')
        FROM pembanding p
        WHERE JSON_CONTAINS(s.pembanding_id, CAST(p.id AS JSON), '$')
    ) AS pembanding

FROM pasar s
ORDER BY s.id ASC;

`);
};

const getAllPasarAllData = async () => {
    const sql = `
        SELECT * FROM pasar 
        ORDER BY id ASC
    `;
    return await queryAll(sql);
};

const findById = async (id) => {
    const sql = `SELECT * FROM pasar WHERE id = ?`;
    return await queryOne(sql, [id]);
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
// Helpers
const toPercent = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toFixed(2)}%`;
};

const toRupiah = (val) => {
    const num = parseFloat(val || 0);
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(num);
};


async function upsertEstimasiPerbandinganPenyesuaianPasar(
    pasarId,
    pembanding,
    labelMap,
    pembandingIndex,
) {
    try {
        for (const key of Object.keys(labelMap)) {
            const mapVal = labelMap[key];

            let label, source;
            if (typeof mapVal === "string") {
                label = mapVal;
                source = null;
            } else if (mapVal && typeof mapVal === "object") {
                label = mapVal.label;
                source = mapVal.source;
            } else {
                continue;
            }

            if (!label) continue;
            if (!Array.isArray(source) || source.length === 0) continue;

            let value = source[pembandingIndex] ?? null;

            // 🔹 kalau value null → skip insert/update
            if (value === null ?? value === undefined) continue;

            // 🔹 kalau "data_kosong" → NULL
            if (value === "data_kosong") {
                value = null;
            } else if (value !== null) {
                // 🔹 selain itu, convert ke float
                value = parseFloat(value);
                if (isNaN(value)) value = null;
            }
            let typeData = "ESTIMASI BANGUNAN"
            // 🔹 Cek existing row dulu
            const selectRes = await db.query(
                `SELECT id, value AS existing_value 
                 FROM elemen_perbandingan_penyesuaian_pasar
                 WHERE pasar_id = ? AND pembanding_id = ? AND label = ? and type = ? LIMIT 1`,
                [pasarId, pembanding.id, label, typeData]
            );

            let rows;
            if (Array.isArray(selectRes)) {
                if (selectRes.length > 0 && Array.isArray(selectRes[0])) {
                    rows = selectRes[0];
                } else {
                    rows = selectRes;
                }
            } else {
                rows = Array.isArray(selectRes) ? selectRes : [selectRes];
            }

            const existing = rows && rows.length ? rows[0] : null;

            // 🔹 Kalau value = 0 → cek existing
            if (value === 0 && existing) {
                if (existing.existing_value !== 0) {
                    value = existing.existing_value;
                }
            }

            if (!existing) {
                await db.query(
                    `INSERT INTO elemen_perbandingan_penyesuaian_pasar
                     (pasar_id, pembanding_id, type, field_key, label, value, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                    [pasarId, pembanding.id, typeData, key, label, value]
                );

            } else {
                await db.query(
                    `UPDATE elemen_perbandingan_penyesuaian_pasar
                     SET value = ?, updated_at = NOW()
                     WHERE id = ? and type = ?`,
                    [value, existing.id, typeData]
                );
            }
        }
    } catch (err) {
        console.error("upsertElemenPerbandinganPenyesuaianPasar error:", err);
        throw err;
    }
}

// 🔹 Helper update elemen_perbandingan_penyesuaian_pasar
async function updateEstimasiPenyesuaianValue(pasarId, pembandingId, key, label, pbValue) {
    try {
        // normalisasi NaN → null
        const safeValue = Number.isNaN(pbValue) ? null : pbValue;
        let typeData = "ESTIMASI BANGUNAN"

        // cek apakah datanya ada
        const [rows] = await db.query(
            `SELECT id, field_key, label FROM elemen_perbandingan_penyesuaian_pasar
             WHERE pasar_id = ? AND pembanding_id = ? AND field_key = ? and type = ?
             LIMIT 1`,
            [pasarId, pembandingId, key, typeData]
        );

        const existing = rows && rows.length ? rows[0] : null;


        if (rows.length === 1) {
            // update value
            await db.query(
                `UPDATE elemen_perbandingan_penyesuaian_pasar
                 SET value = ?, updated_at = NOW()
                 WHERE pasar_id = ? AND pembanding_id = ? AND field_key = ? and type = ?`,
                [safeValue, pasarId, pembandingId, key, typeData]
            );

            return { updated: true, id: existing.id };
        } else {
            const [result] = await db.query(
                `INSERT INTO elemen_perbandingan_penyesuaian_pasar
                 (pasar_id, pembanding_id, type, field_key, label, value, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [pasarId, pembandingId, typeData, key, label ?? key, safeValue ?? null]
            );

            return { inserted: true, id: result.insertId };
        }
    } catch (err) {
        console.error("updatePenyesuaianValue error:", err);
        throw err;
    }
}

const getDataEstimasiBangunanPasar = async (
    id,
    jenis_bangunan_id,
    tahun,
    kfisik,
    kfungsional,
    kekonomis,
    _pembanding_id,
    list_data
) => {
    const sql = `SELECT * FROM pasar WHERE id = ? ORDER BY id ASC`;
    const pasar = await queryOne(sql, [id]);
    if (!pasar) return [];

    const tanahIdList = pasar.tanah_id || [];
    const bangunanIdList = pasar.bangunan_id || [];
    const pembandingIdList = pasar.pembanding_id || [];

    const labelMapData = {
        jenis_bangunan: { label: "Jenis Bangunan", source: jenis_bangunan_id },
        umur_ekonomis: { label: "Umur Ekonomis", source: tahun },
        kondisi_fisik_bangunan_visual: { label: "Kondisi Fisik Bangunan (Visual)", source: kfisik },
        keusangan_fungsional: { label: "Keusangan Fungsional", source: kfungsional },
        keusangan_ekonomis: { label: "Keusangan Ekonomis", source: kekonomis },
    };

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
    for (const [index, pid] of pembandingIdList.entries()) {
        const p = await queryOne(`SELECT * FROM pembanding WHERE id = ?`, [pid]);
        if (p) {
            pembandingData.push(p);
            await upsertEstimasiPerbandinganPenyesuaianPasar(id, p, labelMapData, index);
        }
    }

    const sqlElemenPembanding = `SELECT * FROM elemen_perbandingan_penyesuaian_pasar WHERE pasar_id = ? ORDER BY pasar_id ASC`;
    const dataElemenPembanding = await queryAll(sqlElemenPembanding, [id]);

    jenis_bangunan_id = pembandingIdList.map((pid, idx) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.label === 'Jenis Bangunan'
        );
        const dbValue = el && el.value !== null ? parseFloat(el.value) : 0;
        const inputValue = tahun?.[idx] ?? null;
        return inputValue && inputValue !== 0 ? inputValue : dbValue;
    });

    tahun = pembandingIdList.map((pid, idx) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.label === 'Umur Ekonomis'
        );
        const dbValue = el && el.value !== null ? parseFloat(el.value) : 0;
        const inputValue = tahun?.[idx] ?? null;
        return inputValue && inputValue !== 0 ? inputValue : dbValue;
    });

    kfisik = pembandingIdList.map((pid, idx) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.label === 'Kondisi Fisik Bangunan (Visual)'
        );
        const dbValue = el && el.value !== null ? parseFloat(el.value) : 0;
        const inputValue = kfisik?.[idx] ?? null;
        return inputValue && inputValue !== 0 ? inputValue : dbValue;
    });

    kfungsional = pembandingIdList.map((pid, idx) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.label === 'Keusangan Fungsional'
        );
        const dbValue = el && el.value !== null ? parseFloat(el.value) : 0;
        const inputValue = kfungsional?.[idx] ?? null;
        return inputValue && inputValue !== 0 ? inputValue : dbValue;
    });

    kekonomis = pembandingIdList.map((pid, idx) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.label === 'Keusangan Ekonomis'
        );
        const dbValue = el && el.value !== null ? parseFloat(el.value) : 0;
        const inputValue = kekonomis?.[idx] ?? null;
        return inputValue && inputValue !== 0 ? inputValue : dbValue;
    });

    const fieldMap = {
        jenis_bangunan: "jenis_property",
        umur_ekonomis: "umur_ekonomis",
        indikasi_biaya_pengganti_baru_per_m2: "indikasi_biaya_pengganti_baru_per_m2",
        indikasi_biaya_pengganti_baru_bangunan: "indikasi_biaya_pengganti_baru_bangunan",
        kondisi_fisik_bangunan_visual: "kondisi_fisik_bangunan_visual",
        keusangan_fungsional: "keusangan_fungsional",
        keusangan_ekonomis: "keusangan_ekonomis",
        umur_aktual: "umur_aktual",
        umur_efektif: "umur_efektif",
        sisa_umur_ekonomis: "sisa_umur_ekonomis",
        penyusutan_fisik: "penyusutan_fisik",
        total_penyusutan: "total_penyusutan",
        estimasi_nilai_pasar_bangunan_per_m2: "estimasi_nilai_pasar_bangunan_per_m2",
        estimasi_nilai_pasar_bangunan: "estimasi_nilai_pasar_bangunan",
        estimasi_nilai_pasar_tanah: "estimasi_nilai_pasar_tanah",
        estimasi_nilai_pasar_tanah_per_m2: "estimasi_nilai_pasar_tanah_per_m2",
    };

    const labelMap = {
        jenis_bangunan: "Jenis Bangunan",
        umur_ekonomis: "Umur Ekonomis",
        indikasi_biaya_pengganti_baru_per_m2: "Indikasi Biaya Pengganti Baru /m2",
        indikasi_biaya_pengganti_baru_bangunan: "Indikasi Biaya Pengganti Baru Bangunan",
        kondisi_fisik_bangunan_visual: "Kondisi Fisik Bangunan (Visual)",
        keusangan_fungsional: "Keusangan Fungsional",
        keusangan_ekonomis: "Keusangan Ekonomis",
        umur_aktual: "Umur Aktual",
        umur_efektif: "Umur Efektif",
        sisa_umur_ekonomis: "Sisa Umur Ekonomis",
        penyusutan_fisik: "Penyusutan Fisik",
        total_penyusutan: "Total Penyusutan",
        estimasi_nilai_pasar_bangunan_per_m2: "Estimasi Nilai Pasar Bangunan per m2",
        estimasi_nilai_pasar_bangunan: "Estimasi Nilai Pasar Bangunan",
        estimasi_nilai_pasar_tanah: "Estimasi Nilai Pasar Tanah",
        estimasi_nilai_pasar_tanah_per_m2: "Estimasi Nilai Pasar Tanah per m2",
    };

    const informasiPropertiFields = Object.keys(fieldMap).map((key) => {
        const mapVal = fieldMap[key];

        const items = objectList.map((obj, objIdx) => {
            let objectValue = "";
            if (key === "indikasi_biaya_pengganti_baru_bangunan") {
                const perM2 = parseFloat(obj?.indikasi_biaya_pengganti_baru_per_m2 || 0);
                const luas = parseFloat(obj?.luas_bangunan || 0);
                objectValue = perM2 * luas;
            } else {
                objectValue = obj?.[mapVal] || "";
            }

            const item = {
                object: objectValue,
                data_id: obj?.id ?? `obj-${objIdx}`,
            };

            const sortedPembanding = [...pembandingData].sort((a, b) => (a.id || 0) - (b.id || 0));

            sortedPembanding.forEach((pb, idx) => {
                let pbValue = pb?.[mapVal] || 0;
                const umur_ekonomis_dumy = tahun;
                const indikasi_biaya_pengganti_baru_per_m2_dumy = [40000, 1200000, 12000];
                const kondisiFisikPembanding = kfisik;


                if (key === "indikasi_biaya_pengganti_baru_bangunan") {
                    const perM2 = parseFloat(pb?.indikasi_biaya_pengganti_baru_per_m2 || indikasi_biaya_pengganti_baru_per_m2_dumy[idx] || 0);
                    const luas = parseFloat(pb?.luas_bangunan || 0);
                    pbValue = perM2 * luas;
                    updateEstimasiPenyesuaianValue(id, pb.id, key, labelMap[key], pbValue);
                } else if (key === "indikasi_biaya_pengganti_baru_per_m2") {
                    pbValue = indikasi_biaya_pengganti_baru_per_m2_dumy[idx] || 0;
                    updateEstimasiPenyesuaianValue(id, pb.id, key, labelMap[key], pbValue);
                } else if (key === "jenis_bangunan") {
                    pbValue = jenis_bangunan_id[idx] || 0;
                    // updateEstimasiPenyesuaianValue(id, pb.id, key, labelMap[key], pbValue);

                } else if (key === "umur_ekonomis") {
                    pbValue = umur_ekonomis_dumy[idx] || 0;
                    updateEstimasiPenyesuaianValue(id, pb.id, key, labelMap[key], pbValue);
                } else if (key === "kondisi_fisik_bangunan_visual") {
                    pbValue = kondisiFisikPembanding[idx];
                    // updateEstimasiPenyesuaianValue(id, pb.id, key, labelMap[key], pbValue);
                } else if (key === "keusangan_fungsional") {
                    pbValue = kfungsional[idx];
                    pb._keusanganFungsional = pbValue;
                    // updateEstimasiPenyesuaianValue(id, pb.id, key, labelMap[key], pbValue);
                } else if (key === "keusangan_ekonomis") {
                    pbValue = kekonomis[idx];
                    pb._keusanganEkonomis = pbValue;
                    // updateEstimasiPenyesuaianValue(id, pb.id, key, labelMap[key], pbValue);
                } else if (key === "umur_aktual") {
                    const tahunSekarang = pb?.tahun_dibangun > 0 ? 2025 : 0;
                    const tahunBangun = parseFloat(pb?.tahun_dibangun || 0);
                    const selisih = tahunSekarang && tahunBangun ? tahunSekarang - tahunBangun : 0;
                    const umurEkonomis = parseFloat(umur_ekonomis_dumy?.[idx] || 0);
                    pbValue = umurEkonomis === 0 ? 0 : selisih;
                    pb._umurAktual = pbValue;
                    updateEstimasiPenyesuaianValue(id, pb.id, key, labelMap[key], pbValue);
                } else if (key === "umur_efektif") {
                    const kondisiFisik = (kondisiFisikPembanding[idx] ?? 0) / 100;
                    const umurEkonomis = parseFloat(umur_ekonomis_dumy[idx] || 0);
                    pbValue = (1 - kondisiFisik) * umurEkonomis;
                    pb._umurEfektif = pbValue;
                    updateEstimasiPenyesuaianValue(id, pb.id, key, labelMap[key], pbValue);
                } else if (key === "sisa_umur_ekonomis") {
                    const umurEkonomis = parseFloat(umur_ekonomis_dumy[idx] || 0);
                    const umurEfektif = pb._umurEfektif ?? 0;
                    pbValue = umurEkonomis - umurEfektif;
                    pb._sisaUmurEkonomis = pbValue;
                    updateEstimasiPenyesuaianValue(id, pb.id, key, labelMap[key], pbValue);
                } else if (key === "penyusutan_fisik") {
                    const sisaUmur = parseFloat(pb._sisaUmurEkonomis ?? 0);
                    const umurEkonomis = parseFloat(umur_ekonomis_dumy[idx] || 0);
                    pbValue = sisaUmur === 0 || umurEkonomis === 0
                        ? 0
                        : 1 - (sisaUmur / umurEkonomis);
                    pb._penyusutanFisik = pbValue;
                    updateEstimasiPenyesuaianValue(id, pb.id, key, labelMap[key], pbValue);
                } else if (key === "total_penyusutan") {
                    let penyusutanFisik = pb._penyusutanFisik ?? 0;
                    let keusanganFungsional = kfungsional[idx];
                    let keusanganEkonomis = kekonomis[idx];
                    penyusutanFisik = penyusutanFisik > 1 ? penyusutanFisik / 100 : penyusutanFisik;
                    keusanganFungsional = keusanganFungsional > 1 ? keusanganFungsional / 100 : keusanganFungsional;
                    keusanganEkonomis = keusanganEkonomis > 1 ? keusanganEkonomis / 100 : keusanganEkonomis;
                    pbValue = penyusutanFisik +
                        (1 - penyusutanFisik) * keusanganFungsional +
                        (1 - penyusutanFisik) * keusanganEkonomis;
                    pb._totalPenyusutan = pbValue;
                    pb._penyusutanFisikDisplay = `${(penyusutanFisik * 100).toFixed(2)}%`;
                    pb._keusanganFungsionalDisplay = `${(keusanganFungsional * 100).toFixed(2)}%`;
                    pb._keusanganEkonomisDisplay = `${(keusanganEkonomis * 100).toFixed(2)}%`;
                    updateEstimasiPenyesuaianValue(id, pb.id, key, labelMap[key], pbValue);

                } else if (key === "estimasi_nilai_pasar_bangunan_per_m2") {
                    const totalPenyusutan = pb._totalPenyusutan ?? pb._penyusutanFisik ?? 0;
                    const perM2 = parseFloat(pb?.indikasi_biaya_pengganti_baru_per_m2 || indikasi_biaya_pengganti_baru_per_m2_dumy[idx] || 0);
                    pbValue = (1 - totalPenyusutan) * perM2;
                    pb._estimasiNilaiPasarPerM2 = pbValue;
                    updateEstimasiPenyesuaianValue(id, pb.id, key, labelMap[key], pbValue);

                } else if (key === "estimasi_nilai_pasar_bangunan") {
                    const nilaiPerM2 = pb._estimasiNilaiPasarPerM2 ?? 0;
                    const luas = parseFloat(pb?.luas_bangunan || 0);
                    pbValue = nilaiPerM2 * luas;
                    pb._estimasiNilaiPasarBangunan = pbValue;
                    updateEstimasiPenyesuaianValue(id, pb.id, key, labelMap[key], pbValue);

                } else if (key === "estimasi_nilai_pasar_tanah") {
                    const hargaPenawaranPb = parseFloat(pb?.["harga_penawaran"]) || 0;
                    let diskonPb = parseFloat(pb?.["diskon"]) || 0;
                    if (diskonPb > 1) diskonPb = diskonPb / 100;
                    const hargaSetelahDiskon = Math.round(hargaPenawaranPb * (1 - diskonPb));
                    const estimasiBangunan = pb._estimasiNilaiPasarBangunan ?? 0;
                    pbValue = hargaSetelahDiskon - estimasiBangunan;
                    pb._estimasiNilaiPasarTanah = pbValue;
                    updateEstimasiPenyesuaianValue(id, pb.id, key, labelMap[key], pbValue);

                } else if (key === "estimasi_nilai_pasar_tanah_per_m2") {
                    const estimasiTanah = pb._estimasiNilaiPasarTanah ?? 0;
                    const luasTanah = parseFloat(pb?.luas_tanah || 0);
                    pbValue = luasTanah > 0 ? estimasiTanah / luasTanah : 0;
                    updateEstimasiPenyesuaianValue(id, pb.id, key, labelMap[key], pbValue);

                }

                const keyName = `pembanding${idx + 1}`;
                const keyData = `data`;

                let val =
                    ["jenis_bangunan", "kondisi_fisik_bangunan_visual", "keusangan_fungsional", "keusangan_ekonomis"].includes(key)
                        ? parseFloat(pbValue)
                        : ["penyusutan_fisik", "total_penyusutan"].includes(key)
                            ? toPercent(Math.round(pbValue * 100))
                            : ["umur_aktual", "umur_efektif", "sisa_umur_ekonomis"].includes(key)
                                ? Math.round(pbValue) || 0
                                : toRupiah(pbValue);

                if (typeof val === "number" && isNaN(val)) {
                    val = 0;
                }

                item[keyName] = val;
                item[`${keyData}_id_${idx + 1}`] = pb?.id ?? `pb-${idx}`;
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

    // Ambil data tanah
    for (const tid of tanahIdList) {
        const tanah = await queryOne(`SELECT * FROM tanah WHERE id = ?`, [tid]);
        if (tanah) objectList.push(tanah);
    }

    // Ambil data bangunan
    for (const bid of bangunanIdList) {
        const bangunan = await queryOne(`SELECT * FROM bangunan WHERE id = ?`, [bid]);
        if (bangunan) objectList.push(bangunan);
    }

    // Ambil data pembanding
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
        harga_setelah_diskon: "harga_setelah_diskon", // akan dihitung manual
    };

    const labelMap = {
        unit: "Unit",
        mata_uang: "Mata Uang",
        harga_penawaran: "Harga Penawaran / Transaksi",
        diskon: "Diskon",
        harga_setelah_diskon: "Harga Setelah Diskon",
    };

    const informasiUmumFields = Object.keys(fieldMap).map((key) => {
        const actualKey = fieldMap[key];

        const items = objectList.map((obj) => {
            const item = {};

            if (actualKey === "harga_setelah_diskon") {
                const hargaPenawaran = parseFloat(obj?.["harga_penawaran"]) || 0;
                let diskon = parseFloat(obj?.["diskon"]) || 0;
                if (diskon > 1) diskon = diskon / 100;

                item.object = toRupiah(Math.round(hargaPenawaran * (1 - diskon)));
            } else if (actualKey === "harga_penawaran") {
                item.object = toRupiah(parseFloat(obj?.["harga_penawaran"] || 0));
            } else if (actualKey === "diskon") {
                let diskon = parseFloat(obj?.["diskon"]) || 0;
                if (diskon > 1) diskon = diskon / 100;
                item.object = toPercent(diskon);
            } else {
                item.object = obj?.[actualKey] || "";
            }


            // Hitung untuk pembanding
            pembandingData.forEach((pb, idx) => {
                if (actualKey === "harga_setelah_diskon") {
                    const hargaPenawaranPb = parseFloat(pb?.["harga_penawaran"]) || 0;
                    let diskonPb = parseFloat(pb?.["diskon"]) || 0;
                    if (diskonPb > 1) diskonPb = diskonPb / 100;

                    item[`pembanding${idx + 1}`] = toRupiah(Math.round(hargaPenawaranPb * (1 - diskonPb)));
                } else if (actualKey === "harga_penawaran") {
                    item[`pembanding${idx + 1}`] = toRupiah(parseFloat(pb?.["harga_penawaran"] || 0));
                } else if (actualKey === "diskon") {
                    let diskonPb = parseFloat(pb?.["diskon"]) || 0;
                    if (diskonPb > 1) diskonPb = diskonPb / 100;
                    item[`pembanding${idx + 1}`] = `${Math.round(diskonPb * 100)}%`;
                } else {
                    item[`pembanding${idx + 1}`] = pb?.[actualKey] || "";
                }
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


const getElemenPerbandinganPasar = async (id, hatasProperti, spembiayaan, kPenjualanFinal, pengeluaranSetelahPembelian, kondisiPasar, enilaiPasarTanah) => {
    const sql = `SELECT * FROM pasar WHERE id = ? ORDER BY id ASC`;
    const pasar = await queryOne(sql, [id]);
    if (!pasar) return [];

    const tanahIdList = pasar.tanah_id || [];
    const bangunanIdList = pasar.bangunan_id || [];
    const pembandingIdList = pasar.pembanding_id || [];

    const labelMapData = {
        hak_atas_properti: { label: "Hak Atas Properti yang dialihkan", source: hatasProperti },
        syarat_pembiayaan: { label: "Syarat Pembiayaan", source: spembiayaan },
        kondisi_penjualan: { label: "Kondisi Penjualan", source: kPenjualanFinal },
        pengeluaran_setelah_pembelian: { label: "Pengeluaran yang dilakukan segera setelah pembelian", source: pengeluaranSetelahPembelian },
        kondisi_pasar: { label: "Kondisi Pasar", source: kondisiPasar },

    };

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
    for (const [index, pid] of pembandingIdList.entries()) {
        const p = await queryOne(`SELECT * FROM pembanding WHERE id = ?`, [pid]);
        if (p) {
            pembandingData.push(p);

            // sekarang persen ambil dari array berdasarkan index
            // await upsertElemenPerbandinganPenyesuaianPasar(id, p, labelMapData, index);
        }
    }
    const sqlElemenPembanding = `SELECT * FROM elemen_perbandingan_penyesuaian_pasar WHERE pasar_id = ? ORDER BY pasar_id ASC`;
    const dataElemenPembanding = await queryAll(sqlElemenPembanding, [id]);

    const fieldMap = {
        hak_atas_properti: "hak_atas_properti",
        syarat_pembiayaan: "syarat_pembiayaan",
        kondisi_penjualan: "kondisi_penjualan",
        pengeluaran_setelah_pembelian: "pengeluaran_setelah_pembelian",
        kondisi_pasar: "kondisi_pasar",
        perkiraan_harga_setelah_penyesuaian: "perkiraan_harga_setelah_penyesuaian",
    };

    const labelMap = {
        hak_atas_properti: "Hak Atas Properti yang dialihkan",
        syarat_pembiayaan: "Syarat Pembiayaan",
        kondisi_penjualan: "Kondisi Penjualan",
        pengeluaran_setelah_pembelian: "Pengeluaran yang dilakukan segera setelah pembelian",
        kondisi_pasar: "Kondisi Pasar",
        perkiraan_harga_setelah_penyesuaian: "Perkiraan Harga Transaksi setelah Penyesuaian",
    };

    hatasProperti = pembandingIdList.map((pid, idx) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.label === labelMap.hak_atas_properti
        );
        const dbValue = el && el.persen !== null ? parseFloat(el.persen) : 0;
        const inputValue = hatasProperti?.[idx] ?? null;
        return inputValue && inputValue !== 0 ? inputValue : dbValue;
    });

    spembiayaan = pembandingIdList.map((pid, idx) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.label === labelMap.syarat_pembiayaan
        );
        const dbValue = el && el.persen !== null ? parseFloat(el.persen) : 0;
        const inputValue = spembiayaan?.[idx] ?? null;
        return inputValue && inputValue !== 0 ? inputValue : dbValue;
    });

    kPenjualanFinal = pembandingIdList.map((pid, idx) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.label === labelMap.kondisi_penjualan
        );
        const dbValue = el && el.persen !== null ? parseFloat(el.persen) : 0;
        const inputValue = kPenjualanFinal?.[idx] ?? null;
        return inputValue && inputValue !== 0 ? inputValue : dbValue;
    });

    pengeluaranSetelahPembelian = pembandingIdList.map((pid, idx) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.label === labelMap.pengeluaran_setelah_pembelian
        );
        const dbValue = el && el.persen !== null ? parseFloat(el.persen) : 0;
        const inputValue = pengeluaranSetelahPembelian?.[idx] ?? null;
        return inputValue && inputValue !== 0 ? inputValue : dbValue;
    });

    kondisiPasar = pembandingIdList.map((pid, idx) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.label === labelMap.kondisi_pasar
        );
        const dbValue = el && el.persen !== null ? parseFloat(el.persen) : 0;
        const inputValue = kondisiPasar?.[idx] ?? null;
        return inputValue && inputValue !== 0 ? inputValue : dbValue;
    });

    enilaiPasarTanah = pembandingIdList.map((pid, idx) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.label === labelMap.perkiraan_harga_setelah_penyesuaian
        );
        const dbValue = el && el.persen !== null ? parseFloat(el.persen) : 0;
        const inputValue = enilaiPasarTanah?.[idx] ?? null;
        return inputValue && inputValue !== 0 ? inputValue : dbValue;
    });

    const informasiUmumFields = Object.keys(fieldMap).map((key) => {
        const actualKey = fieldMap[key];

        const objectValue = objectList.map((pb) => ({
            keterangan: pb.keterangan || "-",
            deskripsi: pb.deskripsi || "-",
        }));

        const pembandingValues = pembandingData.map((pb, idx) => {
            if (!pb._cache) pb._cache = {};

            let penyesuaian = null;
            let hasil = null;

            switch (actualKey) {
                case "hak_atas_properti": {
                    const nilaiTanah = parseFloat(enilaiPasarTanah[idx] || 0);
                    const persen = parseFloat(hatasProperti[idx] || 0) / 100;

                    if (!persen) {
                        penyesuaian = 0;
                        hasil = nilaiTanah; // tetap kembalikan nilai tanah asli
                    } else {
                        penyesuaian = persen * nilaiTanah;
                        hasil = nilaiTanah + penyesuaian;
                    }

                    pb._cache.hap = hasil;
                    break;
                }
                case "syarat_pembiayaan": {
                    const prev = pb._cache.hap || 0;
                    const persen = parseFloat(spembiayaan[idx] || 0) / 100;

                    if (!persen) {
                        penyesuaian = 0;
                        hasil = 0;
                    } else {
                        penyesuaian = persen * prev;
                        hasil = prev + penyesuaian;
                    }

                    pb._cache.sp = hasil;
                    break;
                }
                case "kondisi_penjualan": {
                    const prev = pb._cache.sp || 0;
                    const persen = parseFloat(kPenjualanFinal[idx] || 0) / 100;

                    if (!persen) {
                        penyesuaian = 0;
                        hasil = 0;
                    } else {
                        penyesuaian = persen * prev;
                        hasil = prev + penyesuaian;
                    }

                    pb._cache.kp = hasil;
                    break;
                }
                case "pengeluaran_setelah_pembelian": {
                    const prev = pb._cache.kp || 0;
                    const persen = parseFloat(pengeluaranSetelahPembelian[idx] || 0) / 100;

                    if (!persen) {
                        penyesuaian = 0;
                        hasil = 0;
                    } else {
                        penyesuaian = persen * prev;
                        hasil = prev + penyesuaian;
                    }

                    pb._cache.psp = hasil;
                    break;
                }
                case "kondisi_pasar": {
                    const prev = pb._cache.psp || 0;
                    const persen = parseFloat(kondisiPasar[idx] || 0) / 100;

                    if (!persen) {
                        penyesuaian = 0;
                        hasil = 0;
                    } else {
                        penyesuaian = persen * prev;
                        hasil = prev + penyesuaian;
                    }

                    pb._cache.kpasa = hasil;
                    break;
                }
                case "perkiraan_harga_setelah_penyesuaian": {
                    // ambil langsung dari hasil terakhir (kondisi_pasar)
                    hasil = pb._cache.kpasa || 0;
                    penyesuaian = 0; // supaya konsisten di-return, biar nggak undefined
                    break;
                }
            }
            // 🚀 hanya return kalau ada hasil yg dihitung (activeKey itu saja)
            if (hasil !== null) {
                return {
                    deskripsi: pb?.[actualKey] || "",
                    persen:
                        actualKey === "hak_atas_properti" ? (hatasProperti[idx] || 0)
                            : actualKey === "syarat_pembiayaan" ? (spembiayaan[idx] || 0)
                                : actualKey === "kondisi_penjualan" ? (kPenjualanFinal[idx] || 0)
                                    : actualKey === "pengeluaran_setelah_pembelian" ? (pengeluaranSetelahPembelian[idx] || 0)
                                        : actualKey === "kondisi_pasar" ? (kondisiPasar[idx] || 0)
                                            : null,
                    penyesuaian: toRupiah(penyesuaian),
                    hasil: toRupiah(hasil),
                };
            }

            return null;
        }).filter(Boolean); // ⬅️ buang yang null





        return {
            label: labelMap[key],
            objects: objectValue,
            pembanding: pembandingValues,
        };
    });

    return informasiUmumFields;
};


const getElemenPerbandinganLokasiPasar = async (id, jPusatKotaFinal,
    pJalanFinal,
    aLokasiFinal,
    kLingkunganFinal,
    pAsetFinal,
    lainnyaFinal,
    eHargaFinal) => {
    const sql = `SELECT * FROM pasar WHERE id = ? ORDER BY id ASC`;
    const pasar = await queryOne(sql, [id]);
    if (!pasar) return [];

    const tanahIdList = pasar.tanah_id || [];
    const bangunanIdList = pasar.bangunan_id || [];
    const pembandingIdList = pasar.pembanding_id || [];

    const objectList = [];

    // Ambil data tanah
    for (const tid of tanahIdList) {
        const tanah = await queryOne(`SELECT * FROM tanah WHERE id = ?`, [tid]);
        if (tanah) objectList.push(tanah);
    }

    // Ambil data bangunan
    for (const bid of bangunanIdList) {
        const bangunan = await queryOne(`SELECT * FROM bangunan WHERE id = ?`, [bid]);
        if (bangunan) objectList.push(bangunan);
    }

    // Ambil data pembanding
    const pembandingData = [];
    for (const pid of pembandingIdList) {
        const p = await queryOne(`SELECT * FROM pembanding WHERE id = ?`, [pid]);
        if (p) pembandingData.push(p);
    }

    const fieldMap = {
        jarak_pusat_kota: "jarak_pusat_kota",
        perkerasan_jalan: "perkerasan_jalan",
        aksesibilitas_lokasi: "aksesibilitas_lokasi",
        kondisi_lingkungan: "kondisi_lingkungan",
        posisi_aset: "posisi_aset",
        lainnya: "lainnya",
    };

    const labelMap = {
        jarak_pusat_kota: "Jarak terhadap pusat kota",
        perkerasan_jalan: "Perkerasan Jalan/Lebar Jalan",
        aksesibilitas_lokasi: "Aksesibilitas & Lokasi",
        kondisi_lingkungan: "Kondisi Lingkungan",
        posisi_aset: "Posisi Aset",
        lainnya: "Lainnya (Sebutkan)",
    };



    const informasiUmumFields = Object.keys(fieldMap).map((key) => {
        const actualKey = fieldMap[key];

        const objectValue = objectList.map((pb) => ({
            keterangan: pb.keterangan || "-",
            deskripsi: pb.deskripsi || "-",
        }));

        const pembandingValues = pembandingData.map((pb, idx) => {
            if (!pb._cache) pb._cache = {};

            let penyesuaian = null;
            let hasil = null;
            switch (actualKey) {
                case "jarak_pusat_kota": {
                    const nilaiDasar = parseFloat(eHargaFinal[idx] || 0);
                    const persen = parseFloat(jPusatKotaFinal[idx] || 0) / 100;
                    penyesuaian = persen * nilaiDasar;
                    hasil = nilaiDasar + penyesuaian;
                    pb._cache.jp = hasil;
                    break;
                }
                case "perkerasan_jalan": {
                    const prev = parseFloat(eHargaFinal[idx] || 0);
                    const persen = parseFloat(pJalanFinal[idx] || 0) / 100;
                    penyesuaian = persen * prev;
                    hasil = prev + penyesuaian;
                    pb._cache.pj = hasil;
                    break;
                }
                case "aksesibilitas_lokasi": {
                    const prev = parseFloat(eHargaFinal[idx] || 0);
                    const persen = parseFloat(aLokasiFinal[idx] || 0) / 100;
                    penyesuaian = persen * prev;
                    hasil = prev + penyesuaian;
                    pb._cache.al = hasil;
                    break;
                }
                case "kondisi_lingkungan": {
                    const prev = parseFloat(eHargaFinal[idx] || 0);
                    const persen = parseFloat(kLingkunganFinal[idx] || 0) / 100;
                    penyesuaian = persen * prev;
                    hasil = prev + penyesuaian;
                    pb._cache.kl = hasil;
                    break;
                }
                case "posisi_aset": {
                    const prev = parseFloat(eHargaFinal[idx] || 0);
                    const persen = parseFloat(pAsetFinal[idx] || 0) / 100;
                    penyesuaian = persen * prev;
                    hasil = prev + penyesuaian;
                    pb._cache.pa = hasil;
                    break;
                }
                case "lainnya": {
                    const prev = parseFloat(eHargaFinal[idx] || 0);
                    const persen = parseFloat(lainnyaFinal[idx] || 0) / 100;
                    penyesuaian = persen * prev;
                    hasil = prev + penyesuaian;
                    pb._cache.ln = hasil;
                    break;
                }
            }

            return {
                deskripsi: pb?.[actualKey] || "",
                persen:
                    actualKey === "jarak_pusat_kota" ? jPusatKotaFinal[idx]
                        : actualKey === "perkerasan_jalan" ? pJalanFinal[idx]
                            : actualKey === "aksesibilitas_lokasi" ? aLokasiFinal[idx]
                                : actualKey === "kondisi_lingkungan" ? kLingkunganFinal[idx]
                                    : actualKey === "posisi_aset" ? pAsetFinal[idx]
                                        : actualKey === "lainnya" ? lainnyaFinal[idx]
                                            : null,
                penyesuaian: toRupiah(penyesuaian),
                hasil: toRupiah(hasil),
            };
        });


        return {
            label: labelMap[key],
            objects: objectValue,
            pembanding: pembandingValues,
        };
    });

    return informasiUmumFields;
};

const getElemenPerbandinganKarakterFisikPasar = async (
    id,
    luasTanahFinal,
    luasBangunanFinal,
    bentukFinal,
    elevasiFinal,
    topografiFinal,
    lebarMukaFinal,
    peruntukanFinal,
    kondisiBangunanFinal,
    lainnyaFinal,
    pHargaTransaksiPenyesuaian
) => {
    const sql = `SELECT * FROM pasar WHERE id = ? ORDER BY id ASC`;
    const pasar = await queryOne(sql, [id]);
    if (!pasar) return [];

    const tanahIdList = pasar.tanah_id || [];
    const bangunanIdList = pasar.bangunan_id || [];
    const pembandingIdList = pasar.pembanding_id || [];

    const objectList = [];

    // Ambil data tanah
    for (const tid of tanahIdList) {
        const tanah = await queryOne(`SELECT * FROM tanah WHERE id = ?`, [tid]);
        if (tanah) objectList.push(tanah);
    }

    // Ambil data bangunan
    for (const bid of bangunanIdList) {
        const bangunan = await queryOne(`SELECT * FROM bangunan WHERE id = ?`, [bid]);
        if (bangunan) objectList.push(bangunan);
    }

    // Ambil data pembanding
    const pembandingData = [];
    for (const pid of pembandingIdList) {
        const p = await queryOne(`SELECT * FROM pembanding WHERE id = ?`, [pid]);
        if (p) pembandingData.push(p);
    }

    // Helper random


    // Mapping field dengan parameter final + cacheKey
    const fieldMap = {
        luas_tanah: { key: "luas_tanah", label: "Luas Tanah", final: luasTanahFinal ?? [], cacheKey: "lt" },
        luas_bangunan: { key: "luas_bangunan", label: "Luas Bangunan", final: luasBangunanFinal ?? [], cacheKey: "lb" },
        bentuk: { key: "bentuk_tanah", label: "Bentuk", final: bentukFinal ?? [], cacheKey: "bt" },
        elevasi: { key: "elevansi_terhadap_jalan", label: "Elevasi", final: elevasiFinal ?? [], cacheKey: "ev" },
        topografi: { key: "topografi", label: "Topografi", final: topografiFinal ?? [], cacheKey: "tp" },
        lebar_muka: { key: "lebar_muka", label: "Lebar Muka", final: lebarMukaFinal ?? [], cacheKey: "lm" },
        peruntukan: { key: "peruntukan", label: "Peruntukan", final: peruntukanFinal ?? [], cacheKey: "pr" },
        kondisi_bangunan: { key: "kondisi_bangunan", label: "Kondisi Bangunan", final: kondisiBangunanFinal ?? [], cacheKey: "kb" },
        lainnya: { key: "lainnya", label: "Lainnya (Sebutkan)", final: lainnyaFinal ?? [], cacheKey: "ln" },
    };

    const informasiUmumFields = Object.keys(fieldMap).map((fieldKey) => {
        const { key: actualKey, label, final, cacheKey } = fieldMap[fieldKey];

        // object utama (tanah / bangunan)
        const objectValue = objectList.map((pb) => ({
            keterangan: pb.keterangan || "-",
            deskripsi: pb.deskripsi || "-",
        }));

        // pembanding
        const pembandingValues = pembandingData.map((pb, idx) => {
            if (!pb._cache) pb._cache = {};

            const dasar = parseFloat(pHargaTransaksiPenyesuaian[idx] ?? 0);

            // pakai nilai final kalau ada, kalau tidak random
            const persen = parseFloat(final?.[idx]) / 100;

            const penyesuaian = persen * dasar;
            const hasil = dasar + penyesuaian;

            pb._cache[cacheKey] = hasil;

            return {
                deskripsi: pb?.[actualKey] ?? "-",
                persen: final?.[idx],
                penyesuaian: toRupiah(penyesuaian),
                hasil: toRupiah(hasil),
                _numerikPenyesuaian: penyesuaian,
            };
        });

        // Hitung total penyesuaian
        const totalPenyesuaian = pembandingValues.reduce(
            (sum, pb) => sum + (pb._numerikPenyesuaian || 0),
            0
        );

        // Hapus property sementara dan tambahkan totalPenyesuaian
        pembandingValues.forEach(pb => delete pb._numerikPenyesuaian);
        pembandingValues.totalPenyesuaian = toRupiah(totalPenyesuaian);

        return {
            label,
            objects: objectValue,
            pembanding: pembandingValues,
        };
    });

    return informasiUmumFields;
};



const getSummaryPasar = async (id, totalPersent, totalFinal, perkiraan_harga_setelah_penyesuaian) => {
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
        const bangunan = await queryOne(`SELECT * FROM bangunan WHERE id = ?`, [bid]);
        if (bangunan) objectList.push(bangunan);
    }

    const pembandingData = [];
    for (const pid of pembandingIdList) {
        const p = await queryOne(`SELECT * FROM pembanding WHERE id = ?`, [pid]);
        if (p) pembandingData.push(p);
    }

    const fieldMap = {
        jumlahPenyesuaian: "jumlahPenyesuaian",
        indikasiNilai: "indikasiNilai",
        totalBobotAbsolut: "totalBobotAbsolut",
        proporsi: "proporsi",
        inverse: "inverse",
        pembobotanAkhir: "pembobotanAkhir",
    };

    const labelMap = {
        jumlahPenyesuaian: "Jumlah Penyesuaian",
        indikasiNilai: "Indikasi Nilai Sewa Pasar setelah penyesuaian / m²",
        totalBobotAbsolut: "Total Bobot Absolut",
        proporsi: "Proporsi",
        inverse: "Inverse",
        pembobotanAkhir: "Pembobotan Akhir",
    };

    const informasiUmumFields = Object.keys(fieldMap).map((fieldKey) => {
        const actualKey = fieldMap[fieldKey];
        const label = labelMap[fieldKey] || fieldKey;

        let objectValue = objectList.map((obj) => ({
            keterangan: obj.keterangan || "-",
            deskripsi: obj.deskripsi || "-",
        }));

        let pembandingValues = pembandingData.map((pb, idx) => {
            if (!pb._cache) pb._cache = {};
            let hasil = 0;
            let persent = 0;

            switch (actualKey) {
                case "jumlahPenyesuaian":
                    hasil = totalFinal[idx] ?? 0;
                    persent = totalPersent[idx] ?? 0;
                    pb._cache.jp = hasil;
                    break;
                case "indikasiNilai":
                    const jp = pb._cache.jp ?? 0;
                    const phspStr = perkiraan_harga_setelah_penyesuaian[idx] ?? 0;
                    const phsp = parseFloat(phspStr.toString().replace(/[Rp\s\.]/g, '')) || 0;


                    hasil = jp + phsp;
                    persent = 0;
                    pb._cache.indikasiNilai = hasil;


                    break;
                case "totalBobotAbsolut":
                    persent = totalPersent[idx] ?? 0;
                    pb._cache.tba = persent;
                    hasil = 0;
                    break;
                default:
                    hasil = 0;
                    persent = 0;
                    pb._cache[actualKey] = hasil;
                    break;
            }

            return {
                deskripsi: pb?.[actualKey] ?? "",
                persen: 0,
                totalPersen: toPercent(persent),
                totalPenyesuaian: toRupiah(hasil),
            };
        });

        const totalPersentSum = totalPersent.reduce((sum, val) => sum + (val || 0), 0);

        if (actualKey === "totalBobotAbsolut") {
            objectValue = [{ keterangan: "Total Persent", deskripsi: toPercent(totalPersentSum) }];
        }

        if (actualKey === "proporsi") {
            pembandingValues = pembandingData.map((pb, idx) => {
                if (!pb._cache) pb._cache = {};
                const proporsi = totalPersent[idx] && totalPersentSum
                    ? (totalPersent[idx] / totalPersentSum) * 100
                    : 0;

                pb._cache.totProporsi = proporsi;

                return {
                    ...pb,
                    totalPersen: toPercent(proporsi),
                };
            });

            const totalProporsi = pembandingValues.reduce((sum, pbVal) => sum + (pbVal._cache.totProporsi || 0), 0);
            objectValue = [{ keterangan: "Total Proporsi", deskripsi: toPercent(totalProporsi) }];
        }

        if (actualKey === "inverse") {
            pembandingValues = pembandingData.map((pb) => {
                const proporsiFloat = pb._cache?.totProporsi || 0;
                const inverse = 1 - (proporsiFloat / 100);

                pb._cache.totInverse = Math.round(inverse * 100 * 100) / 100;

                return {
                    ...pb,
                    totalPersen: toPercent(pb._cache.totInverse),
                    totalPenyesuaian: inverse,
                };
            });

            const totalInverse = pembandingValues.reduce((sum, pb) => sum + (pb._cache.totInverse || 0), 0);
            const totalInverseCapped = Math.min(totalInverse, 200);

            objectValue = [{
                keterangan: "Total Inverse",
                deskripsi: toPercent(totalInverseCapped),
            }];
        }

        if (actualKey === "pembobotanAkhir") {
            const totalInverse = pembandingData.reduce((sum, pb) => sum + (pb._cache.totInverse || 0), 0);
            const totalInverseCapped = Math.min(totalInverse, 200);

            pembandingValues = pembandingData.map((pb) => {
                const pembobotanAkhir = totalInverseCapped > 0 ? pb._cache.totInverse / totalInverseCapped : 0;

                return {
                    ...pb,
                    pembobotanAkhir,
                    totalPersen: toPercent(pembobotanAkhir * 100),
                };
            });

            const totalPembobotanAkhir = pembandingValues.reduce((sum, pb) => sum + (pb.pembobotanAkhir || 0), 0);
            objectValue = [{
                keterangan: "Total Pembobotan Akhir",
                deskripsi: toPercent(totalPembobotanAkhir * 100),
            }];
        }


        // Tambahkan kesimpulanNilai
        const kesimpulanNilai = pembandingValues.map((pb, idx) => {

            const bobot = pb.pembobotanAkhir ? toPercent(pb.pembobotanAkhir * 100) : "-";
            const nilaiAngka = pb._cache?.indikasiNilai && pb.pembobotanAkhir
                ? pb._cache.indikasiNilai * pb.pembobotanAkhir
                : 0; // pastikan sudah dikalikan

            return {
                jenis_property: pb.jenis_property || "-",
                bobot,
                nilai: toRupiah(nilaiAngka),
                _nilaiAngka: nilaiAngka,// simpan angka mentah untuk sum
            };
        });

        // Total Indikasi per m² (jumlah semua nilai mentah)
        const totalIndikasiPerM2 = kesimpulanNilai.reduce((sum, pb) => sum + (pb._nilaiAngka || 0), 0);
        const obj = objectList[0];
        const luas = obj.luas_bangunan_m2;

        const nilaiMentahList = pembandingValues
            .map(pb => pb._cache?.indikasiNilai || 0)
            .filter(v => typeof v === "number" && !isNaN(v));

        let minNilai = 0;
        let maxNilai = 0;
        let deviasi = 0;

        if (nilaiMentahList.length > 0) {
            minNilai = Math.min(...nilaiMentahList);
            maxNilai = Math.max(...nilaiMentahList);

            // Hitung deviasi hanya jika minNilai > 0
            if (minNilai > 0) {
                deviasi = ((maxNilai - minNilai) / minNilai) * 100;
            }
        }
        // Hitung status berdasarkan deviasi
        const status = (deviasi || 0) <= 15 ? "OK !!!" : "ANALISA ULANG !!";

        return {
            label,
            objects: objectValue,
            pembanding: pembandingValues,
            kesimpulanNilai: [
                ...kesimpulanNilai,
                { jenis_property: "Indikasi Nilai Sewa Pasar / m²", bobot: "-", nilai: toRupiah(totalIndikasiPerM2 || 0) },
                { jenis_property: "Indikasi Nilai Sewa Pasar", bobot: "-", nilai: toRupiah((luas * totalIndikasiPerM2) || 0) },
            ],
            nilaiMaxMinDeviasi: [
                { label: "Min", value: toRupiah(minNilai || 0) },
                { label: "Max", value: toRupiah(maxNilai || 0) },
                { label: "Deviasi", value: toPercent(deviasi || 0) },
            ],
            status // tambahkan status di sini
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
    findById,
    getAllPasarAllData,
    getInformasiUmum,
    getDataTransaksiPasar,
    getDataProperti,
    getDataUnitPerbandingan,
    getDataEstimasiBangunanPasar,
    getElemenPerbandinganPasar,
    getElemenPerbandinganLokasiPasar,
    getElemenPerbandinganKarakterFisikPasar,
    getSummaryPasar,
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
