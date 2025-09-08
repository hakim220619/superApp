const Pasar = require("../models/pasarModel");
const response = require("../../../config/helpers/response");
const {
  findPasarReport,
  updatePenyesuaianKarakterFisikByPasarId,
  updatePenyesuaianElemenPerbandingByPasarId,
} = require("../../../domain/pasar");
const db = require("../../../config/db");
const rupiah = require("../../core/rupiah");

const getAllPasar = async (req, res) => {
  try {
    const pasarList = await Pasar.findAll();
    response.success(res, "Data pasar berhasil diambil", pasarList);
  } catch (err) {
    response.error(res, "Server error", err);
  }
};

const getAllPasarAllData = async (req, res) => {
  try {
    const pasarList = await Pasar.getAllPasarAllData();
    response.success(res, "Data pasar publik berhasil diambil", pasarList);
  } catch (err) {
    response.error(res, "Server error", err);
  }
};

const getInformasiUmum = async (req, res) => {
  try {
    const { id } = req.params;

    const pasarList = await Pasar.getInformasiUmum(id);
    response.success(res, "Data pasar publik berhasil diambil", pasarList);
  } catch (err) {
    response.error(res, "Server error", err);
  }
};

const getDataTransaksiPasar = async (req, res) => {
  try {
    const { id } = req.params;

    const pasarList = await Pasar.getDataTransaksiPasar(id);
    response.success(res, "Data pasar publik berhasil diambil", pasarList);
  } catch (err) {
    response.error(res, "Server error", err);
  }
};

const getDataProperti = async (req, res) => {
  try {
    const { id } = req.params;

    const pasarList = await Pasar.getDataProperti(id);
    response.success(res, "Data pasar publik berhasil diambil", pasarList);
  } catch (err) {
    response.error(res, "Server error", err);
  }
};

const getDataEstimasiBangunanPasar = async (req, res) => {
  try {
    const { id } = req.params;
    let { tahun, kfisik, kfungsional, kekonomis, pembanding_id, list_data } = req.query;

    // pastikan list_data selalu array angka
    if (!Array.isArray(list_data)) {
      list_data = list_data ? [list_data] : [];
    }
    list_data = list_data.map(l => parseInt(l));

    // pastikan tahun selalu array angka
    if (!Array.isArray(tahun)) {
      tahun = tahun ? [tahun] : [];
    }
    tahun = tahun.map(t => parseInt(t) || 0);

    // pastikan kfisik selalu array angka
    if (!Array.isArray(kfisik)) {
      kfisik = kfisik ? [kfisik] : [];
    }
    kfisik = kfisik.map(k => parseInt(k) || 0);

    // pastikan kfungsional selalu array angka
    if (!Array.isArray(kfungsional)) {
      kfungsional = kfungsional ? [kfungsional] : [];
    }
    kfungsional = kfungsional.map(k => parseInt(k) || 0);

    // pastikan kekonomis selalu array angka
    if (!Array.isArray(kekonomis)) {
      kekonomis = kekonomis ? [kekonomis] : [];
    }
    kekonomis = kekonomis.map(k => parseInt(k) || 0);

    // default panjang array final = max(list_data)
    const maxIdx = Math.max(...list_data, 0);
    let tahunFinal = Array(maxIdx).fill(0);
    let kfisikFinal = Array(maxIdx).fill(0);
    let kfungsionalFinal = Array(maxIdx).fill(0);
    let kekonomisFinal = Array(maxIdx).fill(0);

    list_data.forEach((ld, i) => {
      const idx = ld - 1; // list_data dimulai dari 1
      if (idx >= 0 && idx < tahunFinal.length) {
        tahunFinal[idx] = tahun[i] || 0;
        kfisikFinal[idx] = kfisik[i] || 0;
        kfungsionalFinal[idx] = kfungsional[i] || 0;
        kekonomisFinal[idx] = kekonomis[i] || 0;
      }
    });

    const pasarList = await Pasar.getDataEstimasiBangunanPasar(
      id,
      tahunFinal,
      kfisikFinal,
      kfungsionalFinal,
      kekonomisFinal,
      pembanding_id,
      list_data
    );

    response.success(res, "Data pasar publik berhasil diambil", pasarList);
  } catch (err) {
    response.error(res, "Server error", err);
  }
};




const getDataUnitPerbandingan = async (req, res) => {
  try {
    const { id } = req.params;

    const pasarList = await Pasar.getDataUnitPerbandingan(id);
    response.success(res, "Data pasar publik berhasil diambil", pasarList);
  } catch (err) {
    response.error(res, "Server error", err);
  }
};


const getElemenPerbandinganPasar = async (req, res) => {
  try {
    const { id } = req.params;
    let { hak_atas_properti, syarat_pembiayaan, kondisi_penjualan, pengeluaran_setelah_pembelian, kondisi_pasar, estimasi_nilai_pasar_tanah_per_m2, list_data } = req.query;

    // --- normalize list_data ---
    if (!Array.isArray(list_data)) {
      list_data = list_data ? [list_data] : [];
    }
    list_data = list_data.map(l => parseInt(l));

    // --- normalize hak_atas_properti ---
    hak_atas_properti = Array.isArray(hak_atas_properti)
      ? hak_atas_properti.map(v => parseInt(v) || 0)
      : hak_atas_properti ? [parseInt(hak_atas_properti) || 0] : [0];

    // --- normalize syarat_pembiayaan ---
    syarat_pembiayaan = Array.isArray(syarat_pembiayaan)
      ? syarat_pembiayaan.map(v => parseInt(v) || 0)
      : syarat_pembiayaan ? [parseInt(syarat_pembiayaan) || 0] : [0];

    kondisi_penjualan = Array.isArray(kondisi_penjualan)
      ? kondisi_penjualan.map(v => parseInt(v) || 0)
      : kondisi_penjualan ? [parseInt(kondisi_penjualan) || 0] : [0];

    pengeluaran_setelah_pembelian = Array.isArray(pengeluaran_setelah_pembelian)
      ? pengeluaran_setelah_pembelian.map(v => parseInt(v) || 0)
      : pengeluaran_setelah_pembelian ? [parseInt(pengeluaran_setelah_pembelian) || 0] : [0];

    kondisi_pasar = Array.isArray(kondisi_pasar)
      ? kondisi_pasar.map(v => parseInt(v) || 0)
      : kondisi_pasar ? [parseInt(kondisi_pasar) || 0] : [0];

    // --- normalize estimasi_nilai_pasar_tanah_per_m2 ---
    estimasi_nilai_pasar_tanah_per_m2 = Array.isArray(estimasi_nilai_pasar_tanah_per_m2)
      ? estimasi_nilai_pasar_tanah_per_m2
      : estimasi_nilai_pasar_tanah_per_m2 ? [estimasi_nilai_pasar_tanah_per_m2] : [0];

    // --- konversi format Rupiah menjadi angka ---
    estimasi_nilai_pasar_tanah_per_m2 = estimasi_nilai_pasar_tanah_per_m2.map(t => {
      if (!t) return 0;
      const cleaned = t
        .toString()
        .replace(/-?\s*Rp\s*/g, (m) => (m.includes("-") ? "-" : "")) // hilangkan Rp, pertahankan minus
        .replace(/\./g, "") // hilangkan titik ribuan
        .replace(/,/g, ".") // ubah koma jadi titik desimal
        .trim();
      return parseFloat(cleaned) || 0;
    });
    // console.log(estimasi_nilai_pasar_tanah_per_m2);

    const maxIdx = Math.max(...list_data, 0);
    let hpropertiFinal = Array(maxIdx).fill(0);
    let sPembiayaanFinal = Array(maxIdx).fill(0);
    let kPenjualanFinal = Array(maxIdx).fill(0);
    let pengeluaranSetelahPembelianFinal = Array(maxIdx).fill(0);
    let kondisiPasarFinal = Array(maxIdx).fill(0);
    let eNilaiPasarTanahFinal = Array(maxIdx).fill(0);


    list_data.forEach((ld, i) => {
      const idx = ld - 1; // list_data dimulai dari 1
      if (idx >= 0 && idx < hpropertiFinal.length) {
        hpropertiFinal[idx] = hak_atas_properti[i] || 0;
        sPembiayaanFinal[idx] = syarat_pembiayaan[i] || 0;
        kPenjualanFinal[idx] = kondisi_penjualan[i] || 0;
        pengeluaranSetelahPembelianFinal[idx] = pengeluaran_setelah_pembelian[i] || 0;
        kondisiPasarFinal[idx] = kondisi_pasar[i] || 0;
        eNilaiPasarTanahFinal[idx] = estimasi_nilai_pasar_tanah_per_m2[i] || 0;
      }
    });
    // --- panggil model ---
    const pasarList = await Pasar.getElemenPerbandinganPasar(
      id,
      hpropertiFinal,
      sPembiayaanFinal,
      kPenjualanFinal,
      pengeluaranSetelahPembelianFinal,
      kondisiPasarFinal,
      eNilaiPasarTanahFinal
    );

    response.success(res, "Data pasar publik berhasil diambil", pasarList);
  } catch (err) {
    console.error(err);
    response.error(res, "Server error", err);
  }
};

const getElemenPerbandinganLokasiPasar = async (req, res) => {
  try {
    const { id } = req.params;
    let { jarak_pusat_kota, perkerasan_jalan, aksesibilitas_lokasi, kondisi_lingkungan, posisi_aset, lainnya, perkiraan_harga_setelah_penyesuaian, list_data } = req.query;

    // --- normalize list_data ---
    if (!Array.isArray(list_data)) {
      list_data = list_data ? [list_data] : [];
    }
    list_data = list_data.map(l => parseInt(l));

    // --- normalize numeric fields ---
    const normalizeArray = (val) => {
      if (Array.isArray(val)) return val.map(v => parseInt(v) || 0);
      return val ? [parseInt(val) || 0] : [0];
    };

    jarak_pusat_kota = normalizeArray(jarak_pusat_kota);
    perkerasan_jalan = normalizeArray(perkerasan_jalan);
    aksesibilitas_lokasi = normalizeArray(aksesibilitas_lokasi);
    kondisi_lingkungan = normalizeArray(kondisi_lingkungan);
    posisi_aset = normalizeArray(posisi_aset);
    lainnya = normalizeArray(lainnya);

    // --- normalize perkiraan_harga_setelah_penyesuaian (format Rupiah ke angka) ---
    if (!Array.isArray(perkiraan_harga_setelah_penyesuaian)) {
      perkiraan_harga_setelah_penyesuaian = perkiraan_harga_setelah_penyesuaian
        ? [perkiraan_harga_setelah_penyesuaian]
        : [0];
    }
    perkiraan_harga_setelah_penyesuaian = perkiraan_harga_setelah_penyesuaian.map(t => {
      if (!t) return 0;
      const cleaned = t
        .toString()
        .replace(/-?\s*Rp\s*/g, (m) => (m.includes("-") ? "-" : "")) // hilangkan Rp, pertahankan minus
        .replace(/\./g, "") // hilangkan titik ribuan
        .replace(/,/g, ".") // ubah koma jadi titik desimal
        .trim();
      return parseFloat(cleaned) || 0;
    });

    // --- final arrays (panjang sesuai list_data) ---
    const maxIdx = Math.max(...list_data, 0);
    let jarakFinal = Array(maxIdx).fill(0);
    let perkerasanFinal = Array(maxIdx).fill(0);
    let aksesFinal = Array(maxIdx).fill(0);
    let lingkunganFinal = Array(maxIdx).fill(0);
    let posisiFinal = Array(maxIdx).fill(0);
    let lainnyaFinal = Array(maxIdx).fill(0);
    let hargaFinal = Array(maxIdx).fill(0);

    list_data.forEach((ld, i) => {
      const idx = ld - 1; // list_data dimulai dari 1
      if (idx >= 0 && idx < jarakFinal.length) {
        jarakFinal[idx] = jarak_pusat_kota[i] || 0;
        perkerasanFinal[idx] = perkerasan_jalan[i] || 0;
        aksesFinal[idx] = aksesibilitas_lokasi[i] || 0;
        lingkunganFinal[idx] = kondisi_lingkungan[i] || 0;
        posisiFinal[idx] = posisi_aset[i] || 0;
        lainnyaFinal[idx] = lainnya[i] || 0;
        hargaFinal[idx] = perkiraan_harga_setelah_penyesuaian[i] || 0;
      }
    });
    // console.log(jarakFinal);

    // --- panggil model ---
    const pasarList = await Pasar.getElemenPerbandinganLokasiPasar(
      id,
      jarakFinal,
      perkerasanFinal,
      aksesFinal,
      lingkunganFinal,
      posisiFinal,
      lainnyaFinal,
      hargaFinal
    );

    response.success(res, "Data pasar publik berhasil diambil", pasarList);
  } catch (err) {
    console.error(err);
    response.error(res, "Server error", err);
  }
};

const getElemenPerbandinganKarakterFisikPasar = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      luas_tanah,
      luas_bangunan,
      bentuk,
      elevasi,
      topografi,
      lebar_muka,
      peruntukan,
      kondisi_bangunan,
      lainnya,
      perkiraan_harga_setelah_penyesuaian,
      list_data
    } = req.query;

    // --- normalize list_data ---
    if (!Array.isArray(list_data)) {
      list_data = list_data ? [list_data] : [];
    }
    list_data = list_data.map(l => parseInt(l));

    // --- normalize numeric fields ---
    const normalizeArray = (val) => {
      if (Array.isArray(val)) return val.map(v => parseInt(v) || 0);
      return val ? [parseInt(val) || 0] : [0];
    };

    luas_tanah = normalizeArray(luas_tanah);
    luas_bangunan = normalizeArray(luas_bangunan);
    bentuk = normalizeArray(bentuk);
    elevasi = normalizeArray(elevasi);
    topografi = normalizeArray(topografi);
    lebar_muka = normalizeArray(lebar_muka);
    peruntukan = normalizeArray(peruntukan);
    kondisi_bangunan = normalizeArray(kondisi_bangunan);
    lainnya = normalizeArray(lainnya);

    // --- normalize perkiraan_harga_setelah_penyesuaian (format Rupiah ke angka) ---
    if (!Array.isArray(perkiraan_harga_setelah_penyesuaian)) {
      perkiraan_harga_setelah_penyesuaian = perkiraan_harga_setelah_penyesuaian
        ? [perkiraan_harga_setelah_penyesuaian]
        : [0];
    }
    perkiraan_harga_setelah_penyesuaian = perkiraan_harga_setelah_penyesuaian.map(t => {
      if (!t) return 0;
      const cleaned = t
        .toString()
        .replace(/-?\s*Rp\s*/g, (m) => (m.includes("-") ? "-" : "")) // hilangkan Rp, pertahankan minus
        .replace(/\./g, "") // hilangkan titik ribuan
        .replace(/,/g, ".") // ubah koma jadi titik desimal
        .trim();
      return parseFloat(cleaned) || 0;
    });

    // --- final arrays (panjang sesuai list_data) ---
    const maxIdx = Math.max(...list_data, 0);
    let luasTanahFinal = Array(maxIdx).fill(0);
    let luasBangunanFinal = Array(maxIdx).fill(0);
    let bentukFinal = Array(maxIdx).fill(0);
    let elevasiFinal = Array(maxIdx).fill(0);
    let topografiFinal = Array(maxIdx).fill(0);
    let lebarMukaFinal = Array(maxIdx).fill(0);
    let peruntukanFinal = Array(maxIdx).fill(0);
    let kondisiBangunanFinal = Array(maxIdx).fill(0);
    let lainnyaFinal = Array(maxIdx).fill(0);
    let hargaFinal = Array(maxIdx).fill(0);

    list_data.forEach((ld, i) => {
      const idx = ld - 1; // list_data dimulai dari 1
      if (idx >= 0 && idx < luasTanahFinal.length) {
        luasTanahFinal[idx] = luas_tanah[i] || 0;
        luasBangunanFinal[idx] = luas_bangunan[i] || 0;
        bentukFinal[idx] = bentuk[i] || 0;
        elevasiFinal[idx] = elevasi[i] || 0;
        topografiFinal[idx] = topografi[i] || 0;
        lebarMukaFinal[idx] = lebar_muka[i] || 0;
        peruntukanFinal[idx] = peruntukan[i] || 0;
        kondisiBangunanFinal[idx] = kondisi_bangunan[i] || 0;
        lainnyaFinal[idx] = lainnya[i] || 0;
        hargaFinal[idx] = perkiraan_harga_setelah_penyesuaian[i] || 0;
      }
    });

    // --- panggil model ---
    const pasarList = await Pasar.getElemenPerbandinganKarakterFisikPasar(
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
      hargaFinal
    );

    response.success(res, "Data pasar publik berhasil diambil", pasarList);
  } catch (err) {
    console.error(err);
    response.error(res, "Server error", err);
  }
};
const getSummaryPasar = async (req, res) => {
  try {
    const { id } = req.params;
    let { pbId, persent, total, list_data } = req.query;

    // --- normalize list_data ---
    if (!Array.isArray(list_data)) {
      list_data = list_data ? [list_data] : [];
    }
    list_data = list_data.map(l => parseInt(l));

    // --- normalize total ---
    const normalizeArray = (val) => {
      if (Array.isArray(val)) return val.map(v => parseFloat(v) || 0);
      return val ? [parseFloat(val) || 0] : [0];
    };
    total = normalizeArray(total);
    persent = normalizeArray(persent);

    // --- final array sesuai list_data ---
    const maxIdx = Math.max(...list_data, 0);
    let totalFinal = Array(maxIdx).fill(0);
    let persentFinal = Array(maxIdx).fill(0);

    list_data.forEach((ld, i) => {
      const idx = ld - 1; // list_data mulai dari 1
      if (idx >= 0) {
        totalFinal[idx] = total[i] || 0;
        persentFinal[idx] = persent[i] || 0;
      }
    });



    // --- panggil model ---
    const pasarList = await Pasar.getSummaryPasar(
      id,
      persentFinal,
      totalFinal,
      pbId // optional, kalau perlu filter berdasarkan pembanding tertentu
    );

    response.success(res, "Data pasar berhasil diambil", pasarList);
  } catch (err) {
    console.error(err);
    response.error(res, "Server error", err);
  }
};


const getPasarById = async (req, res) => {
  const { id } = req.params;
  try {
    // const pasar = await Pasar.findBy(id);
    const pasar = await findPasarReport(id);
    if (!pasar) return response.error(res, "Data pasar tidak ditemukan", null, 404);
    response.success(res, "Data pasar berhasil diambil", pasar);
  } catch (err) {
    console.log(err);
    response.error(res, "Server error", err);
  }
};

const updatePasar = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Pasar.update(id, req.body);
    response.success(res, "Data pasar berhasil diperbarui", updated);
  } catch (err) {
    response.error(res, "Gagal memperbarui data pasar", err);
  }
};

const deletePasar = async (req, res) => {
  const { id } = req.params;
  try {
    await Pasar.remove(id);
    response.success(res, "Data pasar berhasil dihapus", 201);
  } catch (err) {
    response.error(res, "Gagal menghapus data pasar", err);
  }
};

const createPasar = async (req, res) => {
  try {
    const result = await Pasar.createPasar(req.body); // Pastikan method-nya bernama createPasar
    response.success(res, "Data pasar berhasil dibuat", result, 201);
  } catch (err) {
    response.error(res, "Gagal membuat data pasar", err);
  }
};

const findElemenPerbandingan = async (req, res) => {
  const { pasarId } = req.params;

  try {
    const [pasarRows] = await db.query("SELECT * FROM pasar WHERE id = ?", [pasarId]);
    if (!pasarRows.length) return res.status(404).json({ message: "Data pasar not found" });

    const pasar = pasarRows[0];

    const tanahIds = pasar.tanah_id || [];
    const bangunanIds = pasar.bangunan_id || [];
    const pembandingIds = pasar.pembanding_id || [];

    const [pembandingRows] = await db.query(`SELECT * FROM pembanding WHERE id IN (?)`, [
      pembandingIds,
    ]);

    const [tanahRows] = tanahIds.length
      ? await db.query(`SELECT * FROM tanah WHERE id IN (?)`, [tanahIds])
      : [[]];

    const [bangunanRows] = bangunanIds.length
      ? await db.query(`SELECT * FROM bangunan WHERE id IN (?)`, [bangunanIds])
      : [[]];

    const objectTanah = tanahRows.map((t) => ({
      keterangan: "Jarak dari pusat kota",
      deskripsi: `${t.jarak_terhadap_pusat_kota || "-"}`,
    }));

    const objectBangunan = bangunanRows.map((b) => ({
      keterangan: "Kondisi visual bangunan",
      deskripsi: `${b.konstruksi_bangunan || "-"}`,
    }));

    const elemen_perbandingan = [
      {
        kategori: "Lokasi",
        items: [
          {
            label: "Jarak terhadap pusat kota",
            objects: objectTanah,
            pembanding: pembandingRows.map((pb) => ({
              deskripsi: `${pb.jarak_thd_pusat_kota} km` || "-",
              persen: "90.00%",
              penyesuaian: rupiah(10000),
            })),
          },
          {
            label: "Perkerasan Jalan/Lebar Jalan",
            objects: objectTanah.map((t) => ({
              keterangan: "Jalan depan aset",
              deskripsi: `${t.perkerasan_jalan || "-"} / ${t.row_jalan_m || "-"}`,
            })),
            pembanding: pembandingRows.map((pb) => ({
              deskripsi: `${pb.perkerasan_jalan} / ${pb.row_jalan}`,
              persen: "0.00%",
              penyesuaian: rupiah(0),
            })),
          },
          {
            label: "Kondisi Lingkungan",
            objects:
              objectBangunan.length != 0
                ? objectBangunan
                : [
                  {
                    keterangan: "Gambaran atas kondisi spesifik",
                    deskripsi: "-",
                  },
                ],
            pembanding: pembandingRows.map((pb) => ({
              deskripsi: pb.kondisi_bangunan || "-",
              persen: "0.00%",
              penyesuaian: rupiah(0),
            })),
          },
          {
            label: "Posisi Aset",
            objects:
              objectBangunan.length != 0
                ? objectBangunan
                : [
                  {
                    keterangan: "Posisi atau Letak Objek terhadap akses jalan",
                    deskripsi: "-",
                  },
                ],
            pembanding: pembandingRows.map((pb) => ({
              deskripsi: pb.kondisi_bangunan || "-",
              persen: "0.00%",
              penyesuaian: rupiah(0),
            })),
          },
          {
            label: "Lainnya (sebutkan)",
            objects:
              objectBangunan.length != 0
                ? objectBangunan
                : [
                  {
                    keterangan: "-",
                    deskripsi: "-",
                  },
                ],
            pembanding: pembandingRows.map((pb) => ({
              deskripsi: "-",
              persen: "0.00%",
              penyesuaian: rupiah(0),
            })),
          },
          {
            label: "Perkiraan Harga Transaksi setelah Penyesuaian",
            objects:
              objectBangunan.length != 0
                ? objectBangunan
                : [
                  {
                    keterangan: "Estimasi harga setelah faktor penyesuaian",
                    deskripsi: "-",
                  },
                ],
            pembanding: pembandingRows.map((pb) => ({
              deskripsi: pb.perkiraan_harga_transaksi_setelah_penyesuaian
                ? rupiah(pb.perkiraan_harga_transaksi_setelah_penyesuaian)
                : "-",
              persen: "0.00%",
              penyesuaian: rupiah(0),
            })),
          },
        ],
      },
    ];

    return res.json(elemen_perbandingan);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updatePenyesuaianKarakterFisik = async (req, res) => {
  const { pasarId } = req.params;
  const { raw_persen, label, pembanding_id } = req.body;


  try {
    await updatePenyesuaianKarakterFisikByPasarId(pasarId, {
      raw_persen,
      label,
      pembanding_id,
    });
    return res.status(200).json({ message: "Penyesuaian updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const updatePenyesuaianElemenPerbandingan = async (req, res) => {
  const { pasarId } = req.params;
  const { raw_persen, label, pembanding_id } = req.body;
  console.log(req.body);
  try {
    await updatePenyesuaianElemenPerbandingByPasarId(pasarId, {
      raw_persen,
      label,
      pembanding_id,
    });
    return res.status(200).json({ message: "Penyesuaian updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAllPasar,
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
  getPasarById,
  updatePasar,
  deletePasar,
  createPasar,
  findElemenPerbandingan,
  updatePenyesuaianKarakterFisik,
  updatePenyesuaianElemenPerbandingan,
};

// =((E64-$D$64)/$D$64)*$N$64
