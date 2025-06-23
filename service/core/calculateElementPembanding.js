const { getTotalPersen } = require("../main_service/models/sewaModel");
const rupiah = require("./rupiah");

function calculateElementPembanding(
  tanahRows,
  bangunanRows,
  pembandingRows,
  persen = {}
) {
  const objectTanah = tanahRows.map((t) => ({
    keterangan: "Jarak dari pusat kota",
    deskripsi: `${t.jarak_terhadap_pusat_kota || "-"}`,
  }));

  const objectBangunan = bangunanRows.map((b) => ({
    keterangan: "Kondisi visual bangunan",
    deskripsi: `${b.konstruksi_bangunan || "-"}`,
  }));

  const getPenyesuaian = (label, pb) => {
    const key = `${label}_${pb.id}`;
    const persenVal = parseFloat(persen[key] || 0);
    const indikasi = pb.unit_perbandingan?.indikasi_sewa_m2 || 0;
    return (persenVal * indikasi) / 100;
  };

  const items = [
    {
      label: "Jarak terhadap pusat kota",
      objects: objectTanah,
      pembanding: pembandingRows.map((pb) => {
        const val = getPenyesuaian("Jarak terhadap pusat kota", pb);
        return {
          deskripsi: `${pb.jarak_thd_pusat_kota} km` || "-",
          persen: persen[`Jarak terhadap pusat kota_${pb.id}`] || 0,
          penyesuaian: rupiah(val),
          _value: val,
        };
      }),
    },
    {
      label: "Perkerasan Jalan/Lebar Jalan",
      objects: tanahRows.map((t) => ({
        keterangan: "Jalan depan aset",
        deskripsi: `${t.perkerasan_jalan || "-"} / ${t.row_jalan_m || "-"}`,
      })),
      pembanding: pembandingRows.map((pb) => {
        const val = getPenyesuaian("Perkerasan Jalan/Lebar Jalan", pb);
        return {
          deskripsi: `${pb.perkerasan_jalan} / ${pb.row_jalan}`,
          persen: persen[`Perkerasan Jalan/Lebar Jalan_${pb.id}`] || 0,
          penyesuaian: rupiah(val),
          _value: val,
        };
      }),
    },
    {
      label: "Kondisi Lingkungan",
      objects: objectBangunan.length
        ? objectBangunan
        : [{ keterangan: "Gambaran atas kondisi spesifik", deskripsi: "-" }],
      pembanding: pembandingRows.map((pb) => {
        const val = getPenyesuaian("Kondisi Lingkungan", pb);
        return {
          deskripsi: pb.kondisi_bangunan || "-",
          persen: persen[`Kondisi Lingkungan_${pb.id}`] || 0,
          penyesuaian: rupiah(val),
          _value: val,
        };
      }),
    },
    {
      label: "Posisi Aset",
      objects: objectBangunan.length
        ? objectBangunan
        : [
            {
              keterangan: "Posisi atau Letak Objek terhadap akses jalan",
              deskripsi: "-",
            },
          ],
      pembanding: pembandingRows.map((pb) => {
        const val = getPenyesuaian("Posisi Aset", pb);
        return {
          deskripsi: pb.posisi_aset || "-",
          persen: persen[`Posisi Aset_${pb.id}`] || 0,
          penyesuaian: rupiah(val),
          _value: val,
        };
      }),
    },
    {
      label: "Lainnya (sebutkan)",
      objects: objectBangunan.length
        ? objectBangunan
        : [{ keterangan: "-", deskripsi: "-" }],
      pembanding: pembandingRows.map((pb) => ({
        deskripsi: "-",
        persen: persen[`Lainnya (sebutkan)_${pb.id}`] || 0,
        penyesuaian: "-",
        _value: 0,
      })),
    },
  ];

  // Add total_penyesuaian per item
  for (const item of items) {
    item.total_penyesuaian = item.pembanding.reduce(
      (sum, p) => sum + p._value,
      0
    );
  }

  // Add summary per pembanding index
  const summary = {
    pembanding: pembandingRows.map((_, i) => ({
      total: items.reduce((sum, item) => sum + item.pembanding[i]._value, 0),
      persen: items.reduce((sum, item) => sum + item.pembanding[i].persen, 0),
    })),
  };

  // Remove temp _value
  for (const item of items) {
    item.pembanding.forEach((p) => delete p._value);
  }

  return [
    {
      kategori: "Faktor Fisik",
      total_penyesuaian: items.reduce((sum, i) => sum + i.total_penyesuaian, 0),
      summary,
      items,
    },
  ];
}

function calculateKarakterFisik(
  tanahRows,
  bangunanRows,
  pembandingRows,
  persenMap
) {
  const getPersen = (label, id) => persenMap[label]?.[id] || 0;

  const makeItem = (label, deskripsi, field) => {
    const pembanding = pembandingRows.map((pb) => {
      const persen = getPersen(label, pb.id);
      const indikasi = pb.unit_perbandingan?.indikasi_sewa_m2 || 0;
      const value = Math.ceil((persen * indikasi) / 100);
      return {
        deskripsi: pb[field] || "-",
        persen,
        penyesuaian: rupiah(value),
        _value: value,
      };
    });

    return {
      label,
      objects: [{ keterangan: label, deskripsi }],
      pembanding,
      total_penyesuaian: pembanding.reduce(
        (sum, p) => sum + (p._value || 0),
        0
      ),
    };
  };

  const items = [
    makeItem("Luas Tanah", "200", "luas_tanah"),
    makeItem("Luas Bangunan", "150", "luas_bangunan"),
    makeItem("Bentuk", "Beraturan", "bentuk_tanah"),
    makeItem("Elevasi", "0.20", "elevansi_terhadap_jalan"),
    makeItem("Topografi", "Datar", "topografi"),
    makeItem("Lebar Muka", "Beraturan", "lebar_muka"),
    makeItem("Peruntukan", "Beraturan", "peruntukan"),
    makeItem("Kondisi Bangunan", "Terawat", "kondisi_bangunan"),
    {
      label: "Lainnya (sebutkan)",
      objects: [{ keterangan: "-", deskripsi: "-" }],
      pembanding: pembandingRows.map((pb) => ({
        deskripsi: "-",
        persen: getPersen("Lainnya (sebutkan)", pb.id),
        penyesuaian: "-",
        _value: 0,
      })),
      total_penyesuaian: 0,
    },
  ];

  // Add summary per pembanding index
  const summary = {
    pembanding: pembandingRows.map((_, i) => ({
      total: items.reduce((sum, item) => sum + item.pembanding[i]._value, 0),
      persen: items.reduce((sum, item) => sum + item.pembanding[i].persen, 0),
    })),
  };

  // Clean _value
  items.forEach((item) => item.pembanding.forEach((p) => delete p._value));

  return [
    {
      kategori: "Karakter Fisik",
      total_penyesuaian: items.reduce((sum, i) => sum + i.total_penyesuaian, 0),
      items,
      summary,
    },
  ];
}

function calculateSummary(
  pembandingLuas,
  totalPersen,
  totalPenyesuaian,
  summaryPerbandingan,
  summaryKarakterFisik
) {
  const result = summaryPerbandingan.map((item, index) => ({
    penyesuaian: rupiah(item.total + summaryKarakterFisik[index].total),
    persen: Math.abs(item.persen + summaryKarakterFisik[index].persen),
    total: item.total + summaryKarakterFisik[index].total,
    deskripsi: "",
  }));

  const indikasiNilaiM2 = pembandingLuas.map((pb, index) => {
    const calulcate = result[index].total + pb.indikasi_nilai_m2;
    const roundedUp = Math.ceil(calulcate); // Round up to 612
    console.log("🚀 ~ indikasiNilaiM2 ~ roundedUp:", roundedUp);
    console.log("🚀 ~ indikasiNilaiM2 ~ roundedUp:", roundedUp);

    return {
      deskripsi: "",
      persen: "",
      _penyesuaian: roundedUp,
      penyesuaian: rupiah(roundedUp),
    };
  });

  const totalBobot = result.reduce((sum, item) => sum + item.persen, 0);
  const proporsi = result.map((item) => {
    return {
      deskripsi: "",
      persen: (item.persen / totalBobot).toFixed(2) * 100 + "%",
      _persen: (item.persen / totalBobot).toFixed(2),
      penyesuaian: "",
    };
  });
  console.log("🚀 ~ proporsi ~ proporsi:", proporsi);
  const totalProporsi = proporsi.reduce(
    (sum, item) => sum + parseFloat(item.persen),
    0
  );
  const inverse = proporsi.map((item) => ({
    deskripsi: "",
    persen: Math.floor((1 - item._persen) * 100) + "%",
    _persen: Math.floor((1 - item._persen) * 100),
    penyesuaian: "",
  }));
  const totalInverse = inverse.reduce(
    (sum, item) => sum + parseFloat(item.persen),
    0
  );
  const final = inverse.map((item, index) => {
    const result = item._persen / totalInverse;
    console.log("🚀 ~ final ~ result:", result);
    return {
      deskripsi: "",
      persen: Math.floor(result.toFixed(2) * 100) + "%",
      _persen: Math.floor(result),
      penyesuaian: "",
    };
  });
  const finalTotal = final.reduce(
    (sum, item) => sum + parseFloat(item.persen),
    0
  );
  console.log(Math.min(finalTotal, 100));
  return [
    {
      kategori: "Kesimpulan",
      items: [
        {
          label: "Jumlah Penyesuaian",
          objects: [
            {
              deskripsi: "",
              persen: totalPersen,
              penyesuaian: rupiah(totalPenyesuaian),
            },
          ],
          pembanding: result,
        },
        {
          label: "Indikasi Nilai Sewa Pasar setelah penyesuaian / m²",
          objects: [
            {
              deskripsi: "",
              persen: "",
              penyesuaian: "",
            },
          ],
          pembanding: indikasiNilaiM2,
        },
        {
          label: "Total Bobot Absolut	",
          objects: [
            {
              deskripsi: "",
              persen: totalBobot + "%",
              penyesuaian: "",
            },
          ],
          pembanding: result.map((item) => ({
            deskripsi: "",
            persen: item.persen + "%",
            penyesuaian: "",
          })),
        },
        {
          label: "Proporsi",
          objects: [
            {
              deskripsi: "",
              persen: `${totalProporsi}%`,
              penyesuaian: "",
            },
          ],
          pembanding: proporsi,
        },
        {
          label: "Inverse",
          objects: [
            {
              deskripsi: "",
              persen: `${totalInverse}%`,
              penyesuaian: "",
            },
          ],
          pembanding: inverse,
        },
        {
          label: "Pembobotan Akhir",
          objects: [
            {
              deskripsi: "",
              persen: `${Math.min(finalTotal, 100)}%`,
              penyesuaian: "",
            },
          ],
          pembanding: final,
        },
      ],
    },
  ];
}

function calculateConclusion(
  pembandingRows,
  summaryPerbandingan,
  summaryKarakterFisik,
  final
) {
  const summaryFinal = getPembandingInArray(final, "Pembobotan Akhir");
  const result = summaryPerbandingan.map((item, index) => {
    return {
      label: `Data ${index + 1}`,
      penyesuaian: rupiah(item.total + summaryKarakterFisik[index].total),
      persen: summaryFinal[index]._persen,
      bobot: `${summaryFinal[index].persen}`,
      total: item.total + summaryKarakterFisik[index].total,
      deskripsi: "",
      value:
        summaryFinal[index]._persen *
        pembandingRows[index]["unit_perbandingan"]["indikasi_sewa_m2"],
    };
  });
  const pembanding = pembandingRows.map((pb, index) => {
    const bobot = pb.diskon || 0;
    const value = bobot * (pb.harga_penawaran || 0);
    return {
      label: `Data ${index + 1}`,
      bobot: "",
      value: value,
    };
  });

  const indikasi_nilai_m2 = result.reduce((total, pb) => total + pb.value, 0);

  const indikasi_nilai = pembanding.reduce((total, pb) => total + pb.value, 0);

  return {
    kategori: "Kesimpulan",
    items: {
      label: "Pembobotan Akhir",
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
    indikasi_nilai: rupiah(indikasi_nilai_m2 * 150),
  };
}

function getPembandingInArray(pembanding = [], label) {
  const pembobotanAkhir = pembanding
    .flatMap((entry) => entry.items) // ambil semua items dari semua kategori
    .find((item) => item.label.trim() === label); // cari label "Pembobotan Akhir"
  return pembobotanAkhir ? pembobotanAkhir.pembanding : [];
}

function calculateFinalSummary(final) {
  const summaryFinal = getPembandingInArray(
    final,
    "Indikasi Nilai Sewa Pasar setelah penyesuaian / m²"
  );
  const minPenyesuaian = Math.min(
    ...summaryFinal.map((item) => item._penyesuaian)
  );
  const maxPenyesuaian = Math.max(
    ...summaryFinal.map((item) => item._penyesuaian)
  );
  const deviasi = ((maxPenyesuaian - minPenyesuaian) / minPenyesuaian) * 100;

  return {
    deviasi: deviasi.toFixed(2) + "%" || "0%",
    min: rupiah(minPenyesuaian),
    max: rupiah(maxPenyesuaian),
    status: deviasi < 0.15 ? "OK!!!" : "ANALISA ULANG!!!",
  };
}

module.exports = {
  calculateElementPembanding,
  calculateKarakterFisik,
  calculateSummary,
  calculateConclusion,
  calculateFinalSummary,
};
