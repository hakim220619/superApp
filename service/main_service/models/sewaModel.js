const db = require("../../../config/db");
const {
  queryOne,
  queryAll,
  queryInsertAndGet,
  queryExecute,
} = require("../../../config/helpers/helpers");

const createSewa = async (data) => {
  const insertSql = `
        INSERT INTO sewa (tanah_id, bangunan_id, pembanding_id, created_at)
        VALUES (?, ?, ?, NOW())
    `;
  const insertParams = [
    JSON.stringify(data.tanah_id),
    JSON.stringify(data.bangunan_id),
    JSON.stringify(data.pembanding_id),
  ];

  const selectSql = `SELECT * FROM sewa WHERE id = ?`;

  const result = await queryInsertAndGet(insertSql, insertParams, selectSql);
  return { data: result };
};

const findAll = async () => {
  return await queryAll("SELECT * FROM sewa ORDER BY id ASC");
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
    koordinat: "Koordinat",
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

const getSewaById = async (id) => {
  const sql = `SELECT * FROM sewa WHERE id = ? ORDER BY id ASC`;
  const sewa = await queryOne(sql, [id]);
  if (!sewa) return null;
  return sewa;
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

const getBangunanByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(",");
  const sql = `SELECT * FROM bangunan WHERE id IN (${placeholders})`;
  return await queryAll(sql, ids);
};

async function createDefaultElementPerbandingan(sewaId) {
  const label_elemen_perbandingan_penyesuaian = [
    "Jarak terhadap pusat kota",
    "Perkerasan Jalan/Lebar Jalan",
    "Aksesibilitas & Lokasi",
    "Kondisi Lingkungan",
    "Posisi Aset",
    "Lainnya (Sebutkan)",
  ];
  try {
    const [sewaRows] = await db.query(
      "SELECT pembanding_id FROM sewa WHERE id = ?",
      [sewaId]
    );
    if (!sewaRows.length) throw new Error("Sewa not found");

    const pembandingIds = sewaRows[0].pembanding_id || [];
    if (!Array.isArray(pembandingIds) || pembandingIds.length === 0) return;

    const [pembandingRows] = await db.query(
      `SELECT id FROM pembanding WHERE id IN (${pembandingIds
        .map(() => "?")
        .join(",")})`,
      pembandingIds
    );

    const insertValues = [];

    for (const pb of pembandingRows) {
      for (const label of label_elemen_perbandingan_penyesuaian) {
        const [exists] = await db.query(
          `SELECT 1 FROM elemen_perbandingan_penyesuaian WHERE sewa_id = ? AND pembanding_id = ? AND label = ? LIMIT 1`,
          [sewaId, pb.id, label]
        );

        if (exists.length === 0) {
          insertValues.push([sewaId, pb.id, label, 0.0]);
        }
      }
    }

    if (insertValues.length > 0) {
      await db.query(
        `INSERT INTO elemen_perbandingan_penyesuaian (sewa_id, pembanding_id, label, persen) VALUES ?`,
        [insertValues]
      );
    }

    return true;
  } catch (error) {
    console.error(
      "Error creating default elemen_perbandingan_penyesuaian:",
      error
    );
    throw error;
  }
}

const getPersenPenyesuaian = async (id) => {
  try {
    const [penyesuaianRows] = await db.query(
      `SELECT * FROM elemen_perbandingan_penyesuaian WHERE sewa_id = ?`,
      [id]
    );

    // Convert penyesuaian to a lookup: { [label_pembandingId]: persen }
    const persenLookup = {};
    for (const row of penyesuaianRows) {
      persenLookup[`${row.label}_${row.pembanding_id}`] = parseFloat(
        row.persen
      );
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

async function createDefaultPersenKarakterFisik(sewaId) {
  try {
    const [sewaRows] = await db.query(
      "SELECT pembanding_id FROM sewa WHERE id = ?",
      [sewaId]
    );
    if (!sewaRows.length) throw new Error("Sewa not found");

    const pembandingIds = sewaRows[0].pembanding_id || [];
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
          `SELECT 1 FROM karakter_fisik_penyesuaian WHERE sewa_id = ? AND pembanding_id = ? AND label = ? LIMIT 1`,
          [sewaId, pb.id, label]
        );

        if (exists.length === 0) {
          insertValues.push([sewaId, pb.id, label, 0.0]);
        }
      }
    }

    if (insertValues.length > 0) {
      await db.query(
        `INSERT INTO karakter_fisik_penyesuaian (sewa_id, pembanding_id, label, persen) VALUES ?`,
        [insertValues]
      );
    }

    return true;
  } catch (error) {
    console.error("Error creating default karakter_fisik_penyesuaian:", error);
    throw error;
  }
}

async function loadPersenPenyesuaianFisikFromDB(sewaId) {
  const [rows] = await db.query(
    `SELECT * FROM karakter_fisik_penyesuaian WHERE sewa_id = ?`,
    [sewaId]
  );

  const persenMap = {};

  for (const row of rows) {
    if (!persenMap[row.label]) {
      persenMap[row.label] = {};
    }
    persenMap[row.label][row.pembanding_id] = parseFloat(row.persen);
  }
  return persenMap;
}

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

const getTotalPersen = async (sewaId) => {
  const [rows] = await db.query(
    `
    SELECT SUM(persen) AS total_persen
    FROM (
      SELECT persen FROM elemen_perbandingan_penyesuaian WHERE sewa_id = ?
      UNION ALL
      SELECT persen FROM karakter_fisik_penyesuaian WHERE sewa_id = ?
    ) AS combined
    `,
    [sewaId, sewaId]
  );
  return rows[0].total_persen || 0;
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
    indikasi_sewa_sebelum: "indikasi_sewa_sebelum",
    indikasi_sewa_per_m2: "indikasi_sewa_per_m2",
  };

  const labelMap = {
    unit: "Unit",
    mata_uang: "Mata Uang",
    harga_penawaran: "Harga Penawaran / Transaksi",
    diskon: "Diskon",
    indikasi_sewa_sebelum: "Indikasi Nilai Sewa sebelum penyesuaian",
    indikasi_sewa_per_m2: "Indikasi Nilai Sewa sebelum penyesuaian / m²",
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
  return await queryOne("SELECT * FROM sewa WHERE id = ?", [id]);
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
  const sql = `UPDATE sewa SET ${fields.join(", ")} WHERE id = ?`;
  const result = await queryExecute(sql, values);

  return {
    message: "Data sewa berhasil diperbarui",
    affectedRows: result.affectedRows,
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
  remove,
  getBangunanByIds,
  getPembandingByIds,
  getTanahByIds,
  getSewaById,
  getPersenPenyesuaian,
  createDefaultPersenKarakterFisik,
  loadPersenPenyesuaianFisikFromDB,
  createDefaultElementPerbandingan,
  getTotalPersen,
};
