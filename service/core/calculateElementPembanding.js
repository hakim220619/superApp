const rupiah = require("./rupiah");

// Constants for default values and labels
const CONSTANTS = {
  DEFAULT_VALUE: "-",
  DEVIATION_THRESHOLD: 0.15,
  MAX_PERCENTAGE: 100,
  FAKTOR_FISIK_MULTIPLIER: 150,
  KATEGORI: {
    FAKTOR_FISIK: "Faktor Fisik",
    KARAKTER_FISIK: "Karakter Fisik",
    KESIMPULAN: "Kesimpulan",
  },
  LABELS: {
    JARAK_PUSAT_KOTA: "Jarak terhadap pusat kota",
    PERKERASAN_JALAN: "Perkerasan Jalan/Lebar Jalan",
    KONDISI_LINGKUNGAN: "Kondisi Lingkungan",
    POSISI_ASET: "Posisi Aset",
    LAINNYA: "Lainnya (sebutkan)",
    JUMLAH_PENYESUAIAN: "Jumlah Penyesuaian",
    INDIKASI_NILAI_SEWA: "Indikasi Nilai Sewa Pasar setelah penyesuaian / m²",
    TOTAL_BOBOT_ABSOLUT: "Total Bobot Absolut	",
    PROPORSI: "Proporsi",
    INVERSE: "Inverse",
    PEMBOBOTAN_AKHIR: "Pembobotan Akhir",
  },
};

// Utility functions
const safeParseFloat = (value, defaultValue = 0) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

const safeGet = (obj, path, defaultValue = CONSTANTS.DEFAULT_VALUE) => {
  return obj?.[path] || defaultValue;
};

const createObjectFromTanah = (tanahRows) =>
  tanahRows.map((t) => ({
    keterangan: "Jarak dari pusat kota",
    deskripsi: `${safeGet(t, "jarak_terhadap_pusat_kota")}`,
  }));

const createObjectFromBangunan = (bangunanRows) =>
  bangunanRows.map((b) => ({
    keterangan: "Kondisi visual bangunan",
    deskripsi: `${safeGet(b, "konstruksi_bangunan")}`,
  }));

const calculatePenyesuaian = (label, pb, persen) => {
  const key = `${label}_${pb.id}`;
  const persenData = persen[key] || {};
  const persenVal = safeParseFloat(persenData.persen);
  const rawPersen = safeParseFloat(persenData.raw_persen);
  const indikasi = safeParseFloat(pb.unit_perbandingan?.indikasi_sewa_m2);
  const result = (persenVal * indikasi) / 100;

  return {
    result,
    raw_persen: rawPersen,
    persen: rawPersen,
  };
};

const createPembandingItem = (pb, label, deskripsi, persen) => {
  const { result, raw_persen, persen: persenVal } = calculatePenyesuaian(label, pb, persen);

  return {
    pembanding_id: pb.id,
    deskripsi: deskripsi || CONSTANTS.DEFAULT_VALUE,
    persen: raw_persen || 0,
    raw_persen: raw_persen,
    penyesuaian: rupiah(result),
    _value: result,
  };
};

const createDefaultObjects = (
  objectBangunan,
  defaultKeterangan,
  defaultDeskripsi = CONSTANTS.DEFAULT_VALUE
) =>
  objectBangunan.length
    ? objectBangunan
    : [{ keterangan: defaultKeterangan, deskripsi: defaultDeskripsi }];

const calculateTotalPenyesuaian = (pembandingItems) =>
  pembandingItems.reduce((sum, p) => sum + (p._value || 0), 0);

const createSummaryForPembanding = (items, pembandingRows) => ({
  pembanding: pembandingRows.map((_, i) => ({
    total: items.reduce((sum, item) => sum + (item.pembanding[i]._value || 0), 0),
    persen: items.reduce((sum, item) => sum + (item.pembanding[i].persen || 0), 0),
  })),
});

const cleanTempValues = (items) => {
  items.forEach((item) => item.pembanding.forEach((p) => delete p._value));
};

function calculateElementPembanding(tanahRows, bangunanRows, pembandingRows, persen = {}) {
  const objectTanah = createObjectFromTanah(tanahRows);
  const objectBangunan = createObjectFromBangunan(bangunanRows);

  const items = [
    {
      label: CONSTANTS.LABELS.JARAK_PUSAT_KOTA,
      objects: objectTanah,
      pembanding: pembandingRows.map((pb) =>
        createPembandingItem(
          pb,
          CONSTANTS.LABELS.JARAK_PUSAT_KOTA,
          `${safeGet(pb, "jarak_thd_pusat_kota")} km`,
          persen
        )
      ),
    },
    {
      label: CONSTANTS.LABELS.PERKERASAN_JALAN,
      objects: tanahRows.map((t) => ({
        keterangan: "Jalan depan aset",
        deskripsi: `${safeGet(t, "perkerasan_jalan")} / ${safeGet(t, "row_jalan_m")}`,
      })),
      pembanding: pembandingRows.map((pb) =>
        createPembandingItem(
          pb,
          CONSTANTS.LABELS.PERKERASAN_JALAN,
          `${safeGet(pb, "perkerasan_jalan")} / ${safeGet(pb, "row_jalan")}`,
          persen
        )
      ),
    },
    {
      label: CONSTANTS.LABELS.KONDISI_LINGKUNGAN,
      objects: createDefaultObjects(objectBangunan, "Gambaran atas kondisi spesifik"),
      pembanding: pembandingRows.map((pb) =>
        createPembandingItem(
          pb,
          CONSTANTS.LABELS.KONDISI_LINGKUNGAN,
          safeGet(pb, "kondisi_bangunan"),
          persen
        )
      ),
    },
    {
      label: CONSTANTS.LABELS.POSISI_ASET,
      objects: createDefaultObjects(objectBangunan, "Posisi atau Letak Objek terhadap akses jalan"),
      pembanding: pembandingRows.map((pb) =>
        createPembandingItem(pb, CONSTANTS.LABELS.POSISI_ASET, safeGet(pb, "posisi_aset"), persen)
      ),
    },
    {
      label: CONSTANTS.LABELS.LAINNYA,
      objects: createDefaultObjects(objectBangunan, CONSTANTS.DEFAULT_VALUE),
      pembanding: pembandingRows.map((pb) => ({
        pembanding_id: pb.id,
        deskripsi: CONSTANTS.DEFAULT_VALUE,
        persen: safeParseFloat(persen[`${CONSTANTS.LABELS.LAINNYA}_${pb.id}`]),
        penyesuaian: CONSTANTS.DEFAULT_VALUE,
        _value: 0,
      })),
    },
  ];

  // Calculate total_penyesuaian per item
  items.forEach((item) => {
    item.total_penyesuaian = calculateTotalPenyesuaian(item.pembanding);
  });

  const summary = createSummaryForPembanding(items, pembandingRows);
  cleanTempValues(items);

  return [
    {
      kategori: CONSTANTS.KATEGORI.FAKTOR_FISIK,
      total_penyesuaian: items.reduce((sum, i) => sum + i.total_penyesuaian, 0),
      summary,
      items,
    },
  ];
}

function calculateKarakterFisik(tanahs, pembandingRows, persenMap) {
  const tanah = tanahs[0];

  const getPersen = (label, id, key = "persen") => persenMap[label]?.[id]?.[key] || 0;

  const createKarakterFisikItem = (label, deskripsi, field) => {
    const pembanding = pembandingRows.map((pb) => {
      const persen = getPersen(label, pb.id);
      const raw_persen = getPersen(label, pb.id, "raw_persen");
      const indikasi = safeParseFloat(pb.unit_perbandingan?.indikasi_sewa_m2);
      const value = Math.ceil((persen * indikasi) / 100);

      return {
        pembanding_id: pb.id,
        deskripsi: safeGet(pb, field),
        persen,
        raw_persen,
        penyesuaian: rupiah(value),
        _value: value,
      };
    });

    return {
      label,
      objects: [{ keterangan: label, deskripsi }],
      pembanding,
      total_penyesuaian: calculateTotalPenyesuaian(pembanding),
    };
  };

  const karakterFisikConfig = [
    { label: "Luas Tanah", deskripsi: "200", field: "luas_tanah" },
    { label: "Luas Bangunan", deskripsi: tanah.luas_bangunan_m2, field: "luas_bangunan" },
    { label: "Bentuk", deskripsi: "Beraturan", field: "bentuk_tanah" },
    { label: "Elevasi", deskripsi: "0.20", field: "elevansi_terhadap_jalan" },
    { label: "Topografi", deskripsi: "Datar", field: "topografi" },
    { label: "Lebar Muka", deskripsi: "Beraturan", field: "lebar_muka" },
    { label: "Peruntukan", deskripsi: "Beraturan", field: "peruntukan" },
    { label: "Kondisi Bangunan", deskripsi: "Terawat", field: "kondisi_bangunan" },
  ];

  const items = [
    ...karakterFisikConfig.map((config) =>
      createKarakterFisikItem(config.label, config.deskripsi, config.field)
    ),
    {
      label: CONSTANTS.LABELS.LAINNYA,
      objects: [{ keterangan: CONSTANTS.DEFAULT_VALUE, deskripsi: CONSTANTS.DEFAULT_VALUE }],
      pembanding: pembandingRows.map((pb) => ({
        pembanding_id: pb.id,
        deskripsi: CONSTANTS.DEFAULT_VALUE,
        persen: getPersen(CONSTANTS.LABELS.LAINNYA, pb.id),
        penyesuaian: CONSTANTS.DEFAULT_VALUE,
        _value: 0,
      })),
      total_penyesuaian: 0,
    },
  ];

  const summary = createSummaryForPembanding(items, pembandingRows);
  cleanTempValues(items);

  return [
    {
      kategori: CONSTANTS.KATEGORI.KARAKTER_FISIK,
      total_penyesuaian: items.reduce((sum, i) => sum + i.total_penyesuaian, 0),
      items,
      summary,
    },
  ];
}

// Helper functions for calculateSummary
const createPenyesuaianResult = (summaryPerbandingan, summaryKarakterFisik) =>
  summaryPerbandingan.map((item, index) => ({
    penyesuaian: rupiah(item.total + summaryKarakterFisik[index].total),
    persen: Math.abs(item.persen + summaryKarakterFisik[index].persen),
    total: item.total + summaryKarakterFisik[index].total,
    deskripsi: "",
  }));

const createIndikasiNilaiM2 = (pembandingLuas, result) =>
  pembandingLuas.map((pb, index) => {
    const calculated = result[index].total + pb.indikasi_nilai_m2;
    const roundedUp = Math.ceil(calculated);

    return {
      deskripsi: "",
      persen: "",
      _penyesuaian: roundedUp,
      penyesuaian: rupiah(roundedUp),
    };
  });

const calculateProporsi = (result) => {
  const totalBobot = result.reduce((sum, item) => sum + item.persen, 0);

  return {
    totalBobot,
    proporsi: result.map((item) => ({
      deskripsi: "",
      persen: (item.persen / totalBobot).toFixed(2) * 100 + "%",
      _persen: (item.persen / totalBobot).toFixed(2),
      penyesuaian: "",
    })),
  };
};

const calculateInverse = (proporsi) => {
  const inverse = proporsi.map((item) => ({
    deskripsi: "",
    persen: Math.floor((1 - item._persen) * 100) + "%",
    _persen: Math.floor((1 - item._persen) * 100),
    penyesuaian: "",
  }));

  const totalInverse = inverse.reduce((sum, item) => sum + parseFloat(item.persen), 0);

  return { inverse, totalInverse };
};

const calculateFinalWeighting = (inverse, totalInverse) => {
  const final = inverse.map((item) => {
    const result = item._persen / totalInverse;
    return {
      deskripsi: "",
      persen: Math.floor(result.toFixed(2) * 100) + "%",
      _persen: result,
      penyesuaian: "",
    };
  });

  const finalTotal = final.reduce((sum, item) => sum + parseFloat(item.persen), 0);

  return { final, finalTotal };
};

const createSummaryItem = (label, objects, pembanding) => ({
  label,
  objects,
  pembanding,
});

function calculateSummary(
  pembandingLuas,
  totalPersen,
  totalPenyesuaian,
  summaryPerbandingan,
  summaryKarakterFisik
) {
  const result = createPenyesuaianResult(summaryPerbandingan, summaryKarakterFisik);
  const indikasiNilaiM2 = createIndikasiNilaiM2(pembandingLuas, result);

  const { totalBobot, proporsi } = calculateProporsi(result);
  const totalProporsi = proporsi.reduce((sum, item) => sum + parseFloat(item.persen), 0);

  const { inverse, totalInverse } = calculateInverse(proporsi);
  const { final, finalTotal } = calculateFinalWeighting(inverse, totalInverse);

  return [
    {
      kategori: CONSTANTS.KATEGORI.KESIMPULAN,
      items: [
        createSummaryItem(
          CONSTANTS.LABELS.JUMLAH_PENYESUAIAN,
          [
            {
              deskripsi: "",
              persen: totalPersen,
              penyesuaian: rupiah(totalPenyesuaian),
            },
          ],
          result
        ),
        createSummaryItem(
          CONSTANTS.LABELS.INDIKASI_NILAI_SEWA,
          [
            {
              deskripsi: "",
              persen: "",
              penyesuaian: "",
            },
          ],
          indikasiNilaiM2
        ),
        createSummaryItem(
          CONSTANTS.LABELS.TOTAL_BOBOT_ABSOLUT,
          [
            {
              deskripsi: "",
              persen: totalBobot + "%",
              penyesuaian: "",
            },
          ],
          result.map((item) => ({
            deskripsi: "",
            persen: item.persen + "%",
            penyesuaian: "",
          }))
        ),
        createSummaryItem(
          CONSTANTS.LABELS.PROPORSI,
          [
            {
              deskripsi: "",
              persen: `${totalProporsi}%`,
              penyesuaian: "",
            },
          ],
          proporsi
        ),
        createSummaryItem(
          CONSTANTS.LABELS.INVERSE,
          [
            {
              deskripsi: "",
              persen: `${totalInverse}%`,
              penyesuaian: "",
            },
          ],
          inverse
        ),
        createSummaryItem(
          CONSTANTS.LABELS.PEMBOBOTAN_AKHIR,
          [
            {
              deskripsi: "",
              persen: `${Math.min(finalTotal, CONSTANTS.MAX_PERCENTAGE)}%`,
              penyesuaian: "",
            },
          ],
          final
        ),
      ],
    },
  ];
}

function calculateConclusion(pembandingRows, summaryPerbandingan, summaryKarakterFisik, final) {
  const summaryFinal = getPembandingInArray(final, CONSTANTS.LABELS.PEMBOBOTAN_AKHIR);

  const result = summaryPerbandingan.map((item, index) => {
    const totalAdjustment = item.total + summaryKarakterFisik[index].total;
    const finalWeighting = summaryFinal[index]._persen;
    const indikasi = pembandingRows[index].unit_perbandingan?.indikasi_sewa_m2 || 0;
    const resultFinalValue = finalWeighting * indikasi;

    return {
      label: `Data ${index + 1}`,
      bobot: `${summaryFinal[index].persen}`,
      deskripsi: "",
      value: rupiah(resultFinalValue),
      _value: resultFinalValue,
    };
  });

  const indikasi_nilai_m2 = result.reduce((total, pb) => total + pb._value, 0);

  return {
    kategori: CONSTANTS.KATEGORI.KESIMPULAN,
    items: {
      label: CONSTANTS.LABELS.PEMBOBOTAN_AKHIR,
      objects: [
        {
          deskripsi: "",
          persen: "100%",
          penyesuaian: "",
        },
      ],
      pembanding: result,
    },
    indikasi_nilai_m2: rupiah(indikasi_nilai_m2),
    indikasi_nilai: rupiah(indikasi_nilai_m2 * CONSTANTS.FAKTOR_FISIK_MULTIPLIER),
  };
}

function getPembandingInArray(pembanding = [], label) {
  const targetItem = pembanding
    .flatMap((entry) => entry.items)
    .find((item) => item.label.trim() === label);

  return targetItem ? targetItem.pembanding : [];
}

function calculateFinalSummary(final) {
  const summaryFinal = getPembandingInArray(final, CONSTANTS.LABELS.INDIKASI_NILAI_SEWA);

  if (!summaryFinal.length) {
    return {
      deviasi: "0%",
      min: rupiah(0),
      max: rupiah(0),
      status: "OK!!!",
    };
  }

  const penyesuaianValues = summaryFinal.map((item) => item._penyesuaian);
  const minPenyesuaian = Math.min(...penyesuaianValues);
  const maxPenyesuaian = Math.max(...penyesuaianValues);
  const deviasi = ((maxPenyesuaian - minPenyesuaian) / minPenyesuaian) * 100;

  const isDeviationAcceptable = deviasi / 100 < CONSTANTS.DEVIATION_THRESHOLD;

  return {
    deviasi: deviasi.toFixed(2) + "%",
    min: rupiah(minPenyesuaian),
    max: rupiah(maxPenyesuaian),
    status: isDeviationAcceptable ? "OK!!!" : "ANALISA ULANG!!!",
  };
}

module.exports = {
  calculateElementPembanding,
  calculateKarakterFisik,
  calculateSummary,
  calculateConclusion,
  calculateFinalSummary,
};
