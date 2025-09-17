const db = require("../../../config/db");
const {
    queryOne,
    queryAll,
    queryInsertAndGet,
    queryExecute,
} = require("../../../config/helpers/helpers");

const headerPasar = async (id) => {
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

    return { pasar, object: objectList[0], pembanding: pembandingData }
};

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

    const fieldMapObject = {
        luas_tanah: "luas_tanah_m2",
        luas_bangunan: "luas_bangunan_m2",
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
        const mapValObject = fieldMapObject[key];

        const items = objectList.map((obj) => {
            let objectValue = "";

            if (Array.isArray(mapVal)) {
                const val1 = obj?.[mapVal[0]] || "";
                const val2 = obj?.[mapVal[1]] || "";
                objectValue = `${val1} / ${val2}`;
            } else {
                objectValue = obj?.[mapValObject] || "";
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


async function upsertPenyesuaianPasar(
    typeDataAll,
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

            // 🔹 Cek existing row dulu
            const selectRes = await db.query(
                `SELECT id, value AS existing_value 
                 FROM elemen_perbandingan_penyesuaian_pasar
                 WHERE pasar_id = ? AND pembanding_id = ? AND label = ? and type = ? LIMIT 1`,
                [pasarId, pembanding.id, label, typeDataAll]
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
                    [pasarId, pembanding.id, typeDataAll, key, label, value]
                );

            } else {
                await db.query(
                    `UPDATE elemen_perbandingan_penyesuaian_pasar
                     SET value = ?, updated_at = NOW()
                     WHERE id = ? and type = ?`,
                    [value, existing.id, typeDataAll]
                );
            }
        }
    } catch (err) {
        console.error("upsertElemenPerbandinganPenyesuaianPasar error:", err);
        throw err;
    }
}

const parseRupiah = (val) => {
    if (val == null) return null;
    if (typeof val === "number") return val;
    if (typeof val === "string") {
        const cleaned = val.replace(/Rp\s?/g, "").replace(/\./g, "").replace(/,/g, ".");
        const floatVal = parseFloat(cleaned);
        return isNaN(floatVal) ? null : floatVal;
    }
    return null;
};


// 🔹 Helper update elemen_perbandingan_penyesuaian_pasar
async function updatePenyesuaianValue(
    typeData,
    pasarId,
    pembandingId,
    key,
    label,
    pbValue,
    penyesuaian = null, // opsional
    hasil = null        // opsional
) {
    try {
        // normalisasi NaN → null
        const safeValue = Number.isNaN(pbValue) ? null : pbValue;

        // normalisasi penyesuaian dan hasil
        const penyesuaianValue = parseRupiah(penyesuaian);
        const hasilValue = parseRupiah(hasil);

        // cek apakah datanya ada
        const [rows] = await db.query(
            `SELECT id, field_key, label 
             FROM elemen_perbandingan_penyesuaian_pasar
             WHERE pasar_id = ? AND pembanding_id = ? AND field_key = ? AND type = ?
             LIMIT 1`,
            [pasarId, pembandingId, key, typeData]
        );

        const existing = rows && rows.length ? rows[0] : null;

        if (existing) {
            // update value, penyesuaian, hasil
            await db.query(
                `UPDATE elemen_perbandingan_penyesuaian_pasar
                 SET value = ?, penyesuaian = ?, hasil = ?, updated_at = NOW()
                 WHERE id = ?`,
                [safeValue, penyesuaianValue, hasilValue, existing.id]
            );

            return { updated: true, id: existing.id };
        } else {
            // insert baru, penyesuaian & hasil opsional
            const [result] = await db.query(
                `INSERT INTO elemen_perbandingan_penyesuaian_pasar
                 (pasar_id, pembanding_id, type, field_key, label, value, penyesuaian, hasil, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [pasarId, pembandingId, typeData, key, label ?? key, safeValue, penyesuaianValue, hasilValue]
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
    list_data,
    updateElemenPerbandingan = false,
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
    let typeDataEstimasi = "ESTIMASI BANGUNAN"

    const pembandingData = [];
    for (const [index, pid] of pembandingIdList.entries()) {
        const p = await queryOne(`SELECT * FROM pembanding WHERE id = ?`, [pid]);
        if (p) {
            pembandingData.push(p);
            await upsertPenyesuaianPasar(typeDataEstimasi, id, p, labelMapData, index);
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
                    updatePenyesuaianValue(typeDataEstimasi, id, pb.id, key, labelMap[key], pbValue, null, null);
                } else if (key === "indikasi_biaya_pengganti_baru_per_m2") {
                    pbValue = indikasi_biaya_pengganti_baru_per_m2_dumy[idx] || 0;
                    updatePenyesuaianValue(typeDataEstimasi, id, pb.id, key, labelMap[key], pbValue, null, null);
                } else if (key === "jenis_bangunan") {
                    pbValue = jenis_bangunan_id[idx] || 0;
                    // updatePenyesuaianValue(typeDataEstimasi, id, pb.id, key, labelMap[key], pbValue, null, null);

                } else if (key === "umur_ekonomis") {
                    pbValue = umur_ekonomis_dumy[idx] || 0;
                    updatePenyesuaianValue(typeDataEstimasi, id, pb.id, key, labelMap[key], pbValue, null, null);
                } else if (key === "kondisi_fisik_bangunan_visual") {
                    pbValue = kondisiFisikPembanding[idx];
                    // updatePenyesuaianValue(typeDataEstimasi, id, pb.id, key, labelMap[key], pbValue, null, null);
                } else if (key === "keusangan_fungsional") {
                    pbValue = kfungsional[idx];
                    pb._keusanganFungsional = pbValue;
                    // updatePenyesuaianValue(typeDataEstimasi, id, pb.id, key, labelMap[key], pbValue, null, null);
                } else if (key === "keusangan_ekonomis") {
                    pbValue = kekonomis[idx];
                    pb._keusanganEkonomis = pbValue;
                    // updatePenyesuaianValue(typeDataEstimasi, id, pb.id, key, labelMap[key], pbValue, null, null);
                } else if (key === "umur_aktual") {
                    const tahunSekarang = pb?.tahun_dibangun > 0 ? 2025 : 0;
                    const tahunBangun = parseFloat(pb?.tahun_dibangun || 0);
                    const selisih = tahunSekarang && tahunBangun ? tahunSekarang - tahunBangun : 0;
                    const umurEkonomis = parseFloat(umur_ekonomis_dumy?.[idx] || 0);
                    pbValue = umurEkonomis === 0 ? 0 : selisih;
                    pb._umurAktual = pbValue;
                    updatePenyesuaianValue(typeDataEstimasi, id, pb.id, key, labelMap[key], pbValue, null, null);
                } else if (key === "umur_efektif") {
                    const kondisiFisik = (kondisiFisikPembanding[idx] ?? 0) / 100;
                    const umurEkonomis = parseFloat(umur_ekonomis_dumy[idx] || 0);
                    pbValue = (1 - kondisiFisik) * umurEkonomis;
                    pb._umurEfektif = pbValue;
                    updatePenyesuaianValue(typeDataEstimasi, id, pb.id, key, labelMap[key], pbValue, null, null);
                } else if (key === "sisa_umur_ekonomis") {
                    const umurEkonomis = parseFloat(umur_ekonomis_dumy[idx] || 0);
                    const umurEfektif = pb._umurEfektif ?? 0;
                    pbValue = umurEkonomis - umurEfektif;
                    pb._sisaUmurEkonomis = pbValue;
                    updatePenyesuaianValue(typeDataEstimasi, id, pb.id, key, labelMap[key], pbValue, null, null);
                } else if (key === "penyusutan_fisik") {
                    const sisaUmur = parseFloat(pb._sisaUmurEkonomis ?? 0);
                    const umurEkonomis = parseFloat(umur_ekonomis_dumy[idx] || 0);
                    pbValue = sisaUmur === 0 || umurEkonomis === 0
                        ? 0
                        : 1 - (sisaUmur / umurEkonomis);
                    pb._penyusutanFisik = pbValue;
                    updatePenyesuaianValue(typeDataEstimasi, id, pb.id, key, labelMap[key], pbValue, null, null);
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
                    updatePenyesuaianValue(typeDataEstimasi, id, pb.id, key, labelMap[key], pbValue, null, null);

                } else if (key === "estimasi_nilai_pasar_bangunan_per_m2") {
                    const totalPenyusutan = pb._totalPenyusutan ?? pb._penyusutanFisik ?? 0;
                    const perM2 = parseFloat(pb?.indikasi_biaya_pengganti_baru_per_m2 || indikasi_biaya_pengganti_baru_per_m2_dumy[idx] || 0);
                    pbValue = (1 - totalPenyusutan) * perM2;
                    pb._estimasiNilaiPasarPerM2 = pbValue;
                    updatePenyesuaianValue(typeDataEstimasi, id, pb.id, key, labelMap[key], pbValue, null, null);

                } else if (key === "estimasi_nilai_pasar_bangunan") {
                    const nilaiPerM2 = pb._estimasiNilaiPasarPerM2 ?? 0;
                    const luas = parseFloat(pb?.luas_bangunan || 0);
                    pbValue = nilaiPerM2 * luas;
                    pb._estimasiNilaiPasarBangunan = pbValue;
                    updatePenyesuaianValue(typeDataEstimasi, id, pb.id, key, labelMap[key], pbValue, null, null);

                } else if (key === "estimasi_nilai_pasar_tanah") {
                    const hargaPenawaranPb = parseFloat(pb?.["harga_penawaran"]) || 0;
                    let diskonPb = parseFloat(pb?.["diskon"]) || 0;
                    if (diskonPb > 1) diskonPb = diskonPb / 100;
                    const hargaSetelahDiskon = Math.round(hargaPenawaranPb * (1 - diskonPb));
                    const estimasiBangunan = pb._estimasiNilaiPasarBangunan ?? 0;
                    pbValue = hargaSetelahDiskon - estimasiBangunan;
                    pb._estimasiNilaiPasarTanah = pbValue;
                    updatePenyesuaianValue(typeDataEstimasi, id, pb.id, key, labelMap[key], pbValue, null, null);

                } else if (key === "estimasi_nilai_pasar_tanah_per_m2") {
                    const estimasiTanah = pb._estimasiNilaiPasarTanah ?? 0;
                    const luasTanah = parseFloat(pb?.luas_tanah || 0);
                    pbValue = luasTanah > 0 ? estimasiTanah / luasTanah : 0;
                    updatePenyesuaianValue(typeDataEstimasi, id, pb.id, key, labelMap[key], pbValue, null, null);

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


    if (updateElemenPerbandingan === true) {

        try {
            db.query(
                `UPDATE elemen_perbandingan_penyesuaian_pasar
                 SET value = NULL,  penyesuaian = NULL, hasil = NULL, updated_at = NOW()
                 WHERE pasar_id = ? and pembanding_id = ? AND \`type\` = ?`,
                [id, _pembanding_id, "ELEMEN PERBANDINGAN"]
            );
        } catch (err) {
            console.error("Gagal reset value:", err);
        }
    }

    return informasiPropertiFields;
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
    let typeDataElemen = "ELEMEN PERBANDINGAN"
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
            await upsertPenyesuaianPasar(typeDataElemen, id, p, labelMapData, index);
        }
    }

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

    const [dataElemenPembanding] = await db.query(
        `SELECT * FROM elemen_perbandingan_penyesuaian_pasar 
         WHERE pasar_id = ? AND \`type\` = ?`,
        [id, typeDataElemen] // pastikan parameter sesuai urutan placeholder
    );
    hatasProperti = pembandingIdList.map((pid, idx) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === 'hak_atas_properti'
        );
        const dbValue = el && el.value != null ? el.value : 0;
        return dbValue;
    });


    spembiayaan = pembandingIdList.map((pid, idx) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === 'syarat_pembiayaan'
        );
        const dbValue = el && el.value != null ? parseFloat(el.value) : 0;
        return dbValue;
    });

    kPenjualanFinal = pembandingIdList.map((pid, idx) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === 'kondisi_penjualan'
        );
        const dbValue = el && el.value != null ? parseFloat(el.value) : 0;
        return dbValue;
    });

    pengeluaranSetelahPembelian = pembandingIdList.map((pid, idx) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === 'pengeluaran_setelah_pembelian'
        );
        const dbValue = el && el.value != null ? parseFloat(el.value) : 0;
        return dbValue;
    });

    kondisiPasar = pembandingIdList.map((pid, idx) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === 'kondisi_pasar'
        );
        const dbValue = el && el.value != null ? parseFloat(el.value) : 0;
        return dbValue;
    });

    const [getenilaiPasarTanah] = await db.query(
        `SELECT * FROM elemen_perbandingan_penyesuaian_pasar 
         WHERE pasar_id = ? AND \`type\` = ? and field_key = ?`,
        [id, "ESTIMASI BANGUNAN", "estimasi_nilai_pasar_tanah_per_m2"]
    );
    enilaiPasarTanah = pembandingIdList.map((pid, idx) => {
        const el = getenilaiPasarTanah.find(
            e => e.pembanding_id === pid && e.field_key === 'estimasi_nilai_pasar_tanah_per_m2'
        );

        const dbValue = el && el.value != null ? parseFloat(el.value) : 0;
        return dbValue;
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

                    updatePenyesuaianValue(typeDataElemen, id, pb.id, key, labelMap[key], hatasProperti[idx], penyesuaian, hasil);

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

                    updatePenyesuaianValue(typeDataElemen, id, pb.id, key, labelMap[key], spembiayaan[idx], penyesuaian, hasil);
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

                    updatePenyesuaianValue(typeDataElemen, id, pb.id, key, labelMap[key], kPenjualanFinal[idx], penyesuaian, hasil);
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

                    updatePenyesuaianValue(typeDataElemen, id, pb.id, key, labelMap[key], pengeluaranSetelahPembelian[idx], penyesuaian, hasil);
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

                    updatePenyesuaianValue(typeDataElemen, id, pb.id, key, labelMap[key], kondisiPasar[idx], penyesuaian, hasil);
                    break;
                }
                case "perkiraan_harga_setelah_penyesuaian": {
                    // ambil langsung dari hasil terakhir (kondisi_pasar)
                    hasil = pb._cache.kpasa || 0;
                    penyesuaian = 0; // supaya konsisten di-return, biar nggak undefined
                    persen = 0;
                    updatePenyesuaianValue(typeDataElemen, id, pb.id, key, labelMap[key], persen, penyesuaian, hasil);
                    break;
                }
            }
            // 🚀 hanya return kalau ada hasil yg dihitung (activeKey itu saja)
            if (hasil !== null) {
                return {
                    id: pb?.id ?? null,
                    [`deskripsi_${idx + 1}`]: pb?.[actualKey] || "",
                    [`persen_${idx + 1}`]:
                        actualKey === "hak_atas_properti" ? (hatasProperti[idx] || 0)
                            : actualKey === "syarat_pembiayaan" ? (spembiayaan[idx] || 0)
                                : actualKey === "kondisi_penjualan" ? (kPenjualanFinal[idx] || 0)
                                    : actualKey === "pengeluaran_setelah_pembelian" ? (pengeluaranSetelahPembelian[idx] || 0)
                                        : actualKey === "kondisi_pasar" ? (kondisiPasar[idx] || 0)
                                            : null,
                    [`penyesuaian_${idx + 1}`]: toRupiah(penyesuaian),
                    [`hasil_${idx + 1}`]: toRupiah(hasil),
                };
            }



            return null;
        }).filter(Boolean);

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
    let typeDataElemen = "ELEMEN PERBANDINGAN LOKASI"

    const labelMapData = {
        jarak_pusat_kota: { label: "Jarak terhadap pusat kota", source: jPusatKotaFinal },
        perkerasan_jalan: { label: "Perkerasan Jalan/Lebar Jalan", source: pJalanFinal },
        aksesibilitas_lokasi: { label: "Aksesibilitas & Lokasi", source: aLokasiFinal },
        kondisi_lingkungan: { label: "Kondisi Lingkungan", source: kLingkunganFinal },
        posisi_aset: { label: "Posisi Aset", source: pAsetFinal },
        lainnya: { label: "Lainnya (Sebutkan)", source: lainnyaFinal }
    };


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
    for (const [index, pid] of pembandingIdList.entries()) {
        const p = await queryOne(`SELECT * FROM pembanding WHERE id = ?`, [pid]);
        if (p) {
            pembandingData.push(p);
            await upsertPenyesuaianPasar(typeDataElemen, id, p, labelMapData, index);
        }
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

    const [dataElemenPembanding] = await db.query(
        `SELECT * FROM elemen_perbandingan_penyesuaian_pasar 
         WHERE pasar_id = ? AND \`type\` = ?`,
        [id, typeDataElemen]
    );

    jPusatKotaFinal = pembandingIdList.map((pid) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === 'jarak_pusat_kota'
        );
        return el && el.value != null ? parseFloat(el.value) : 0;
    });

    pJalanFinal = pembandingIdList.map((pid) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === 'perkerasan_jalan'
        );
        return el && el.value != null ? parseFloat(el.value) : 0;
    });

    aLokasiFinal = pembandingIdList.map((pid) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === 'aksesibilitas_lokasi'
        );
        return el && el.value != null ? parseFloat(el.value) : 0;
    });

    kLingkunganFinal = pembandingIdList.map((pid) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === 'kondisi_lingkungan'
        );
        return el && el.value != null ? parseFloat(el.value) : 0;
    });

    pAsetFinal = pembandingIdList.map((pid) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === 'posisi_aset'
        );
        return el && el.value != null ? parseFloat(el.value) : 0;
    });

    lainnyaFinal = pembandingIdList.map((pid) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === 'lainnya'
        );
        return el && el.value != null ? parseFloat(el.value) : 0;
    });

    const [getPHargaSenyesuaian] = await db.query(
        `SELECT * FROM elemen_perbandingan_penyesuaian_pasar 
         WHERE pasar_id = ? AND \`type\` = ? and field_key = ?`,
        [id, "ELEMEN PERBANDINGAN", "perkiraan_harga_setelah_penyesuaian"]
    );

    eHargaFinal = pembandingIdList.map((pid) => {
        const el = getPHargaSenyesuaian.find(
            e => e.pembanding_id === pid && e.field_key === 'perkiraan_harga_setelah_penyesuaian'
        );

        return el && el.hasil != null ? parseFloat(el.hasil) : 0;
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
            let persen = 0;

            if (actualKey === "jarak_pusat_kota") {
                const nilaiDasar = parseFloat(eHargaFinal[idx] || 0);
                persen = parseFloat(jPusatKotaFinal[idx] || 0);
                penyesuaian = (persen / 100) * nilaiDasar;
                hasil = nilaiDasar + penyesuaian;
                pb._cache.jp = hasil;
                updatePenyesuaianValue(typeDataElemen, id, pb.id, key, labelMap[key], jPusatKotaFinal[idx], penyesuaian, hasil = 0);

            } else if (actualKey === "perkerasan_jalan") {
                const prev = parseFloat(eHargaFinal[idx] || 0);
                persen = parseFloat(pJalanFinal[idx] || 0);
                penyesuaian = (persen / 100) * prev;
                hasil = prev + penyesuaian;
                pb._cache.pj = hasil;
                updatePenyesuaianValue(typeDataElemen, id, pb.id, key, labelMap[key], pJalanFinal[idx], penyesuaian, hasil = 0);

            } else if (actualKey === "aksesibilitas_lokasi") {
                const prev = parseFloat(eHargaFinal[idx] || 0);
                persen = parseFloat(aLokasiFinal[idx] || 0);
                penyesuaian = (persen / 100) * prev;
                hasil = prev + penyesuaian;
                pb._cache.al = hasil;
                updatePenyesuaianValue(typeDataElemen, id, pb.id, key, labelMap[key], aLokasiFinal[idx], penyesuaian, hasil = 0);

            } else if (actualKey === "kondisi_lingkungan") {
                const prev = parseFloat(eHargaFinal[idx] || 0);
                persen = parseFloat(kLingkunganFinal[idx] || 0);
                penyesuaian = (persen / 100) * prev;
                hasil = prev + penyesuaian;
                pb._cache.kl = hasil;
                updatePenyesuaianValue(typeDataElemen, id, pb.id, key, labelMap[key], kLingkunganFinal[idx], penyesuaian, hasil = 0);

            } else if (actualKey === "posisi_aset") {
                const prev = parseFloat(eHargaFinal[idx] || 0);
                persen = parseFloat(pAsetFinal[idx] || 0);
                penyesuaian = (persen / 100) * prev;
                hasil = prev + penyesuaian;
                pb._cache.pa = hasil;
                updatePenyesuaianValue(typeDataElemen, id, pb.id, key, labelMap[key], pAsetFinal[idx], penyesuaian, hasil = 0);

            } else if (actualKey === "lainnya") {
                const prev = parseFloat(eHargaFinal[idx] || 0);
                persen = parseFloat(lainnyaFinal[idx] || 0);
                penyesuaian = (persen / 100) * prev;
                hasil = prev + penyesuaian;
                pb._cache.ln = hasil;
                updatePenyesuaianValue(typeDataElemen, id, pb.id, key, labelMap[key], lainnyaFinal[idx], penyesuaian, hasil = 0);

            }

            return {
                id: pb?.id || null,
                [`deskripsi_${idx + 1}`]: pb?.[actualKey] || "",
                [`persen_${idx + 1}`]: persen || 0,
                [`penyesuaian_${idx + 1}`]: toRupiah(penyesuaian || 0),
                // [`hasil_${idx + 1}`]: toRupiah(hasil || 0),
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
    let typeDataElemenFisik = "ELEMEN PERBANDINGAN KARAKTER FISIK"
    const tanahIdList = pasar.tanah_id || [];
    const bangunanIdList = pasar.bangunan_id || [];
    const pembandingIdList = pasar.pembanding_id || [];

    const labelMapData = {
        luas_tanah: { label: "Luas Tanah", source: luasTanahFinal },
        luas_bangunan: { label: "Luas Bangunan", source: luasBangunanFinal },
        bentuk: { label: "Bentuk", source: bentukFinal },
        elevasi: { label: "Elevasi", source: elevasiFinal },
        topografi: { label: "Topografi", source: topografiFinal },
        lebar_muka: { label: "Lebar Muka", source: lebarMukaFinal },
        peruntukan: { label: "Peruntukan", source: peruntukanFinal },
        kondisi_bangunan: { label: "Kondisi Bangunan", source: kondisiBangunanFinal },
        lainnya: { label: "Lainnya (Sebutkan)", source: lainnyaFinal },
    };


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
    for (const [index, pid] of pembandingIdList.entries()) {
        const p = await queryOne(`SELECT * FROM pembanding WHERE id = ?`, [pid]);
        if (p) {
            pembandingData.push(p);
            await upsertPenyesuaianPasar(typeDataElemenFisik, id, p, labelMapData, index);
        }
    }
    const fieldMap = {
        luas_tanah: "luas_tanah",
        luas_bangunan: "luas_bangunan",
        bentuk: "bentuk",
        elevasi: "elevasi",
        topografi: "topografi",
        lebar_muka: "lebar_muka",
        peruntukan: "peruntukan",
        kondisi_bangunan: "kondisi_bangunan",
        lainnya: "lainnya",
    };


    const labelMap = {
        luas_tanah: "Luas Tanah",
        luas_bangunan: "Luas Bangunan",
        bentuk: "Bentuk",
        elevasi: "Elevasi",
        topografi: "Topografi",
        lebar_muka: "Lebar Muka",
        peruntukan: "Peruntukan",
        kondisi_bangunan: "Kondisi Bangunan",
        lainnya: "Lainnya (Sebutkan)",
    };


    const [dataElemenPembanding] = await db.query(
        `SELECT * FROM elemen_perbandingan_penyesuaian_pasar 
         WHERE pasar_id = ? AND \`type\` = ?`,
        [id, typeDataElemenFisik]
    );


    luasTanahFinal = pembandingIdList.map((pid) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === "luas_tanah"
        );
        return el && el.value != null ? parseFloat(el.value) : 0;
    });

    luasBangunanFinal = pembandingIdList.map((pid) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === "luas_bangunan"
        );
        return el && el.value != null ? parseFloat(el.value) : 0;
    });

    bentukFinal = pembandingIdList.map((pid) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === "bentuk"
        );
        return el && el.value != null ? parseFloat(el.value) : 0;
    });
    // console.log(bentukFinal);


    elevasiFinal = pembandingIdList.map((pid) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === "elevasi"
        );
        return el && el.value != null ? parseFloat(el.value) : 0;
    });

    topografiFinal = pembandingIdList.map((pid) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === "topografi"
        );
        return el && el.value != null ? parseFloat(el.value) : 0;
    });

    lebarMukaFinal = pembandingIdList.map((pid) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === "lebar_muka"
        );
        return el && el.value != null ? parseFloat(el.value) : 0;
    });

    peruntukanFinal = pembandingIdList.map((pid) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === "peruntukan"
        );
        return el && el.value != null ? parseFloat(el.value) : 0;
    });

    kondisiBangunanFinal = pembandingIdList.map((pid) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === "kondisi_bangunan"
        );
        return el && el.value != null ? parseFloat(el.value) : 0;
    });

    lainnyaFinal = pembandingIdList.map((pid) => {
        const el = dataElemenPembanding.find(
            e => e.pembanding_id === pid && e.field_key === "lainnya"
        );
        return el && el.value != null ? parseFloat(el.value) : 0;
    });

    const [getPHargaPenyesuaian] = await db.query(
        `SELECT * FROM elemen_perbandingan_penyesuaian_pasar 
         WHERE pasar_id = ? AND \`type\` = ? and field_key = ?`,
        [id, "ELEMEN PERBANDINGAN", "perkiraan_harga_setelah_penyesuaian"]
    );


    pHargaTransaksiPenyesuaian = pembandingIdList.map((pid) => {
        const el = getPHargaPenyesuaian.find(
            e => e.pembanding_id === pid && e.field_key === "perkiraan_harga_setelah_penyesuaian"
        );
        return el && el.hasil != null ? parseFloat(el.hasil) : 0;
    });


    const informasiUmumFields = Object.keys(fieldMap).map((key) => {
        const actualKey = fieldMap[key]; // field key
        const label = labelMap[key];

        // object utama (tanah / bangunan)
        const objectValue = objectList.map((pb) => ({
            keterangan: pb.keterangan || "-",
            deskripsi: pb.deskripsi || "-",
        }));

        const pembandingValues = pembandingData.map((pb, idx) => {
            if (!pb._cache) pb._cache = {};

            let penyesuaian = 0;
            let hasil = 0;
            let persen = 0;

            const prev = parseFloat(pHargaTransaksiPenyesuaian[idx] || 0); // harga dasar
            // console.log(actualKey);

            // if (actualKey === "luas_tanah") {
            //     persen = parseFloat(luasTanahFinal[idx] || 0);
            //     penyesuaian = (persen / 100) * prev;
            //     hasil = prev + penyesuaian;
            //     pb._cache.lt = hasil;

            //     updatePenyesuaianValue(typeDataElemen, id, pb.id, key, label, luasTanahFinal[idx], penyesuaian, hasil);

            // } else if (actualKey === "luas_bangunan") {
            //     persen = parseFloat(luasBangunanFinal[idx] || 0);
            //     penyesuaian = (persen / 100) * prev;
            //     hasil = prev + penyesuaian;
            //     pb._cache.lb = hasil;
            //     updatePenyesuaianValue(typeDataElemen, id, pb.id, key, label, luasBangunanFinal[idx], penyesuaian, hasil);

            // } else 
            if (actualKey === "bentuk") {
                persen = parseFloat(bentukFinal[idx] || 0);

                penyesuaian = (persen / 100) * prev;
                hasil = prev + penyesuaian;
                pb._cache.bt = hasil;


                updatePenyesuaianValue(typeDataElemenFisik, id, pb.id, key, label, bentukFinal[idx], penyesuaian, hasil);

            } else if (actualKey === "elevasi") {
                persen = parseFloat(elevasiFinal[idx] || 0);
                penyesuaian = (persen / 100) * prev;
                hasil = prev + penyesuaian;
                pb._cache.ev = hasil;
                updatePenyesuaianValue(typeDataElemenFisik, id, pb.id, key, label, elevasiFinal[idx], penyesuaian, hasil);

            } else if (actualKey === "topografi") {
                persen = parseFloat(topografiFinal[idx] || 0);
                penyesuaian = (persen / 100) * prev;
                hasil = prev + penyesuaian;
                pb._cache.tp = hasil;
                updatePenyesuaianValue(typeDataElemenFisik, id, pb.id, key, label, topografiFinal[idx], penyesuaian, hasil);

            } else if (actualKey === "lebar_muka") {
                persen = parseFloat(lebarMukaFinal[idx] || 0);
                penyesuaian = (persen / 100) * prev;
                hasil = prev + penyesuaian;
                pb._cache.lm = hasil;
                updatePenyesuaianValue(typeDataElemenFisik, id, pb.id, key, label, lebarMukaFinal[idx], penyesuaian, hasil);

            } else if (actualKey === "peruntukan") {
                persen = parseFloat(peruntukanFinal[idx] || 0);
                penyesuaian = (persen / 100) * prev;
                hasil = prev + penyesuaian;
                pb._cache.pr = hasil;
                updatePenyesuaianValue(typeDataElemenFisik, id, pb.id, key, label, peruntukanFinal[idx], penyesuaian, hasil);

            } else if (actualKey === "kondisi_bangunan") {
                persen = parseFloat(kondisiBangunanFinal[idx] || 0);
                penyesuaian = (persen / 100) * prev;
                hasil = prev + penyesuaian;
                pb._cache.kb = hasil;
                updatePenyesuaianValue(typeDataElemenFisik, id, pb.id, key, label, kondisiBangunanFinal[idx], penyesuaian, hasil);

            } else if (actualKey === "lainnya") {
                persen = parseFloat(lainnyaFinal[idx] || 0);
                penyesuaian = (persen / 100) * prev;
                hasil = prev + penyesuaian;
                pb._cache.ln = hasil;
                updatePenyesuaianValue(typeDataElemenFisik, id, pb.id, key, label, lainnyaFinal[idx], penyesuaian, hasil);
            }

            return {
                id: pb?.id || null,
                [`deskripsi_${idx + 1}`]: pb?.[actualKey] || "",
                [`persen_${idx + 1}`]: persen || 0,
                [`penyesuaian_${idx + 1}`]: toRupiah(penyesuaian || 0),
                [`hasil_${idx + 1}`]: toRupiah(hasil || 0),
            };
        });

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
    let typeData = "HASIL PERHITUNGAN PENYESUAIAN PASAR"

    const tanahIdList = pasar.tanah_id || [];
    const bangunanIdList = pasar.bangunan_id || [];
    const pembandingIdList = pasar.pembanding_id || [];
    const labelMapData = {
        jumlahPenyesuaian: { label: "Jumlah Penyesuaian", source: ['data_kosong'] },
        indikasiNilai: { label: "Indikasi Nilai Sewa Pasar setelah penyesuaian / m²", source: ['data_kosong'] },
        totalBobotAbsolut: { label: "Total Bobot Absolut", source: ['data_kosong'] },
        proporsi: { label: "Proporsi", source: ['data_kosong'] },
        inverse: { label: "Inverse", source: ['data_kosong'] },
        pembobotanAkhir: { label: "Pembobotan Akhir", source: ['data_kosong'] },
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
            await upsertPenyesuaianPasar(typeData, id, p, labelMapData, index);
        }
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
    const [dataElemenPembanding] = await db.query(
        `SELECT * 
         FROM elemen_perbandingan_penyesuaian_pasar 
         WHERE pasar_id = ? 
           AND (
                (\`type\` IN (?, ?) AND field_key != ?) 
                OR (\`type\` = ? AND field_key = ?)
           )`,
        [
            id,
            "ELEMEN PERBANDINGAN LOKASI",
            "ELEMEN PERBANDINGAN KARAKTER FISIK",
            "kondisi_bangunan", // exclude kondisi_bangunan
            "ELEMEN PERBANDINGAN",
            "perkiraan_harga_setelah_penyesuaian"
        ]
    );

    const resultArr = Object.values(
        dataElemenPembanding.reduce((acc, row) => {
            if (!acc[row.pembanding_id]) {
                acc[row.pembanding_id] = {
                    pembanding_id: row.pembanding_id,
                    jumlahPenyesuaianPersen: 0,
                    jumlahPenyesuaian: 0,
                    indikasiNilai: 0,
                    totalBobotAbsolut: 0,
                    proporsi: 0,
                    inverse: 0,
                    pembobotanAkhir: 0
                };
            }

            const val = Number(row.value) || 0;
            const valPenyesuaian = Number(row.penyesuaian) || 0;

            // Lokasi / Karakter Fisik → tambahkan ke penyesuaian & total
            if (
                row.type === "ELEMEN PERBANDINGAN LOKASI" ||
                row.type === "ELEMEN PERBANDINGAN KARAKTER FISIK"
            ) {
                acc[row.pembanding_id].jumlahPenyesuaianPersen += val;
                acc[row.pembanding_id].jumlahPenyesuaian += valPenyesuaian;
                acc[row.pembanding_id].totalBobotAbsolut += val;
            }

            // Perkiraan harga setelah penyesuaian → simpan & jumlahkan
            if (
                row.type === "ELEMEN PERBANDINGAN" &&
                row.field_key === "perkiraan_harga_setelah_penyesuaian"
            ) {
                const perkiraan = Number(row.hasil) || 0;
                acc[row.pembanding_id].indikasiNilai =
                    acc[row.pembanding_id].jumlahPenyesuaian + perkiraan;
            }

            return acc;
        }, {})
    );
    for (const item of resultArr) {
        const pb = pembandingData.find(p => p.id === item.pembanding_id);
        if (pb) {
            item.jenis_properti = pb.jenis_property;
        }
    }

    // Hitung total bobot absolut keseluruhan
    const totalBobotAbsolutAll = resultArr.reduce(
        (sum, item) => sum + item.totalBobotAbsolut,
        0
    );

    // Step 1: hitung proporsi (dibuat persen biar konsisten dengan Excel)
    resultArr.forEach(item => {
        item.proporsi = totalBobotAbsolutAll > 0
            ? (item.totalBobotAbsolut / totalBobotAbsolutAll)
            : 0;
    });

    // Step 2: hitung inverse = jumlah semua proporsi selain dirinya
    resultArr.forEach((item, idx) => {
        item.inverse = 1 - item.proporsi

    });

    // Step 3: hitung total inverse all
    const totalInverseAll = resultArr.reduce((sum, item) => sum + item.inverse, 0);

    // Step 4: pembobotan akhir = inverse / totalInverseAll
    resultArr.forEach(item => {
        item.pembobotanAkhir = totalInverseAll > 0
            ? item.inverse / totalInverseAll
            : 0;
    });

    // Step 5: hitung total proporsi, inverse, pembobotan akhir
    const totalProporsi = resultArr.reduce((sum, item) => sum + item.proporsi, 0) * 100; // %
    const totalInverse = resultArr.reduce((sum, item) => sum + item.inverse, 0);
    const totalPembobotanAkhir = resultArr.reduce((sum, item) => sum + item.pembobotanAkhir, 0) * 100; // %
    const totalIndikasiPerM2 = resultArr.reduce((acc, pb) => {
        return acc + ((pb.pembobotanAkhir * pb.indikasiNilai) || 0);
    }, 0);
    // ambil luas bangunan dari object utama (bukan pembanding)
    const luasBangunanUtama = objectList.length > 0 ? objectList[0].luas_bangunan_m2 || 0 : 0;
    // ambil nilai indikasi terhitung (dari pembobotanAkhir * indikasiNilai)
    const nilaiIndikasiArr = resultArr.map(pb => (pb.pembobotanAkhir * pb.indikasiNilai) || 0);

    // cari min, max, dan deviasi
    const minNilai = Math.min(...nilaiIndikasiArr);
    const maxNilai = Math.max(...nilaiIndikasiArr);

    // Deviasi sederhana = (max - min) / max → dalam persen
    const deviasi = maxNilai > 0 ? (maxNilai - minNilai) / maxNilai : 0;

    const deviasiResult = [
        { label: "Min", value: toRupiah(minNilai || 0) },
        { label: "Max", value: toRupiah(maxNilai || 0) },
        { label: "Deviasi", value: toPercent(deviasi * 100) }
    ];

    // ambil deviasi dalam persen (angka)
    const deviasiPercent = deviasi * 100;

    // tentukan status
    const status =
        deviasiPercent <= 15 ? "OK !!!" : "ANALISA ULANG !!";

    const kesimpulanNilai = [
        ...resultArr.map((pb) => ({
            jenis_property: pb.jenis_properti,
            bobot: toPercent(pb.pembobotanAkhir * 100),
            nilai: toRupiah((pb.pembobotanAkhir * pb.indikasiNilai) || 0)
        })),
        {
            jenis_property: "Indikasi Nilai Sewa Pasar / m²",
            bobot: "-",
            nilai: toRupiah(totalIndikasiPerM2 || 0)
        },
        {
            jenis_property: "Indikasi Nilai Sewa Pasar",
            bobot: "-",
            nilai: toRupiah((luasBangunanUtama * totalIndikasiPerM2) || 0)
        },
    ];

    const finalResult = {
        pembanding: resultArr.map(item => ({
            ...item,
            indikasiNilai: toRupiah(item.indikasiNilai),
            jumlahPenyesuaian: toRupiah(item.jumlahPenyesuaian),
            jumlahPenyesuaianPersen: toPercent(item.jumlahPenyesuaianPersen),
            totalBobotAbsolut: toPercent(item.totalBobotAbsolut),
            proporsi: (item.proporsi * 100).toFixed(2) + "%",
            inverse: (item.inverse * 100).toFixed(2) + "%",
            pembobotanAkhir: (item.pembobotanAkhir * 100).toFixed(2) + "%"
        })),
        object: {
            totalBobotAbsolutAll: toPercent(totalBobotAbsolutAll),
            totalProporsi: totalProporsi.toFixed(2) + "%",
            totalInverse: (totalInverse * 100).toFixed(2) + "%",
            totalPembobotanAkhir: totalPembobotanAkhir.toFixed(2) + "%"
        },
        kesimpulanNilai,
        deviasi: [...deviasiResult],
        status
    };

    const informasiUmumFields = Object.keys(fieldMap).map((fieldKey) => {
        const label = labelMap[fieldKey] || fieldKey;


        return {
            label,
            objects: finalResult.object,
            pembanding: finalResult.pembanding,

        };

    });
    return {
        informasiUmumFields,
        kesimpulanNilai: finalResult.kesimpulanNilai,
        nilaiMaxMinDeviasi: finalResult.deviasi,
        status: finalResult.status
    };

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
    headerPasar,
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
