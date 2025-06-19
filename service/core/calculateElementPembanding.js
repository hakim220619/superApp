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
    const result = (persenVal * indikasi) / 100;
    console.log(
      `[DEBUG] ${label} - ID: ${pb.id}, Persen: ${persenVal}, Indikasi: ${indikasi}, Penyesuaian: ${result}`
    );
    return result;
  };

  return [
    {
      kategori: "Faktor Fisik",
      items: [
        {
          label: "Jarak terhadap pusat kota",
          objects: objectTanah,
          pembanding: pembandingRows.map((pb) => ({
            deskripsi: `${pb.jarak_thd_pusat_kota} km` || "-",
            persen: persen[`Jarak terhadap pusat kota_${pb.id}`] || 0,
            penyesuaian: rupiah(
              getPenyesuaian("Jarak terhadap pusat kota", pb)
            ),
          })),
        },
        {
          label: "Perkerasan Jalan/Lebar Jalan",
          objects: tanahRows.map((t) => ({
            keterangan: "Jalan depan aset",
            deskripsi: `${t.perkerasan_jalan || "-"} / ${t.row_jalan_m || "-"}`,
          })),
          pembanding: pembandingRows.map((pb) => ({
            deskripsi: `${pb.perkerasan_jalan} / ${pb.row_jalan}`,
            persen: persen[`Perkerasan Jalan/Lebar Jalan_${pb.id}`] || 0,
            penyesuaian: rupiah(
              getPenyesuaian("Perkerasan Jalan/Lebar Jalan", pb)
            ),
          })),
        },
        {
          label: "Kondisi Lingkungan",
          objects: objectBangunan.length
            ? objectBangunan
            : [
                {
                  keterangan: "Gambaran atas kondisi spesifik",
                  deskripsi: "-",
                },
              ],
          pembanding: pembandingRows.map((pb) => ({
            deskripsi: pb.kondisi_bangunan || "-",
            persen: persen[`Kondisi Lingkungan_${pb.id}`] || 0,
            penyesuaian: rupiah(getPenyesuaian("Kondisi Lingkungan", pb)),
          })),
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
          pembanding: pembandingRows.map((pb) => ({
            deskripsi: pb.posisi_aset || "-",
            persen: persen[`Posisi Aset_${pb.id}`] || 0,
            penyesuaian: rupiah(getPenyesuaian("Posisi Aset", pb)),
          })),
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
          })),
        },
      ],
    },
  ];
}

function calculateKarakterFisik(
  tanahRows,
  bangunanRows,
  pembandingRows,
  persen
) {
  return [
    {
      kategori: "",
      items: [
        {
          label: "Luas Tanah",
          objects: [
            {
              keterangan: "Luas Tanah",
              deskripsi: "200",
            },
          ],
          pembanding: pembandingRows.map((pb, index) => ({
            deskripsi: pb.luas_tanah || "-",
            persen: persen[pb.id],
            penyesuaian: rupiah(
              5 * pembandingRows[index].unit_perbandingan["indikasi_sewa_m2"]
            ),
          })),
        },
        {
          label: "Luas Bangunan",
          objects: [
            {
              keterangan: "Luas Bangunan",
              deskripsi: "150",
            },
          ],
          pembanding: pembandingRows.map((pb, index) => ({
            deskripsi: pb.luas_bangunan || "-",
            persen: persen[pb.id],
            penyesuaian: rupiah(
              5 * pembandingRows[index].unit_perbandingan["indikasi_sewa_m2"]
            ),
          })),
        },
        {
          label: "Bentuk",
          objects: [
            {
              keterangan: "Bentuk Tanah",
              deskripsi: "Beraturan",
            },
          ],
          pembanding: pembandingRows.map((pb, index) => ({
            deskripsi: pb.bentuk_tanah || "-",
            persen: persen[pb.id],
            penyesuaian: rupiah(
              5 * pembandingRows[index].unit_perbandingan["indikasi_sewa_m2"]
            ),
          })),
        },
        {
          label: "Elevasi",
          objects: [
            {
              keterangan: "Ketinggian permukaan tanah terhadap jalan",
              deskripsi: "0.20",
            },
          ],
          pembanding: pembandingRows.map((pb, index) => ({
            deskripsi: pb.elevansi_terhadap_jalan || "-",
            persen: persen[pb.id],
            penyesuaian: rupiah(
              5 * pembandingRows[index].unit_perbandingan["indikasi_sewa_m2"]
            ),
          })),
        },
        {
          label: "Topografi",
          objects: [
            {
              keterangan: "Kontur (Kondisi Permukaan tanah)",
              deskripsi: "Datar",
            },
          ],
          pembanding: pembandingRows.map((pb, index) => ({
            deskripsi: pb.topografi || "-",
            persen: persen[pb.id],
            penyesuaian: rupiah(
              5 * pembandingRows[index].unit_perbandingan["indikasi_sewa_m2"]
            ),
          })),
        },
        {
          label: "Lebar Muka",
          objects: [
            {
              keterangan: "Lebar depan berbatasan Jalan",
              deskripsi: "Beraturan",
            },
          ],
          pembanding: pembandingRows.map((pb, index) => ({
            deskripsi: pb.lebar_muka || "-",
            persen: persen[pb.id],
            penyesuaian: rupiah(
              5 * pembandingRows[index].unit_perbandingan["indikasi_sewa_m2"]
            ),
          })),
        },
        {
          label: "Peruntukan",
          objects: [
            {
              keterangan: "Rencana Tata Ruang Wilayah",
              deskripsi: "Beraturan",
            },
          ],
          pembanding: pembandingRows.map((pb, index) => ({
            deskripsi: pb.peruntukan || "-",
            persen: persen[pb.id],
            penyesuaian: rupiah(
              5 * pembandingRows[index].unit_perbandingan["indikasi_sewa_m2"]
            ),
          })),
        },
        {
          label: "Kondisi Bangunan",
          objects: [
            {
              keterangan: "Terawat atau Tidak terawat",
              deskripsi: "Terawat",
            },
          ],
          pembanding: pembandingRows.map((pb, index) => ({
            deskripsi: pb.kondisi_bangunan || "-",
            persen: persen[pb.id],
            penyesuaian: rupiah(
              5 * pembandingRows[index].unit_perbandingan["indikasi_sewa_m2"]
            ),
          })),
        },
        {
          label: "Lainnya (sebutkan)",
          objects: [
            {
              keterangan: "-",
              deskripsi: "-",
            },
          ],
          pembanding: pembandingRows.map((pb, index) => ({
            deskripsi: "-",
            persen: persen[pb.id],
            penyesuaian: "-",
          })),
        },
      ],
    },
  ];
}

function calculateSummary(
  tanahRows,
  bangunanRows,
  pembandingRows,
  persen = {}
) {
  return [
    {
      kategori: "Kesimpulan",
      items: [
        {
          label: "Jumlah Penyesuaian",
          objects: [
            {
              persen: "4,50%",
              value: "Rp28.500",
            },
          ],
          pembanding: [
            {
              persen: "4,50%",
              value: "Rp28.500",
            },
            {
              persen: "4,50%",
              value: "Rp28.500",
            },
          ],
        },
        {
          label: "Indikasi Nilai Sewa Pasar setelah penyesuaian / m²	",
          objects: [
            {
              persen: "",
              value: "",
            },
          ],
          pembanding: [
            {
              persen: "4,50%",
              value: "Rp28.500",
            },
            {
              persen: "4,50%",
              value: "Rp28.500",
            },
          ],
        },
      ],
    },
  ];
}

module.exports = {
  calculateElementPembanding,
  calculateKarakterFisik,
  calculateSummary,
};
