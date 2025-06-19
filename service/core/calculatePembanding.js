const rupiah = require("./rupiah");

function calculatePembanding(pembandingData) {
  return pembandingData.map((pb) => {
    const after_diskon = pb.harga_penawaran * (1 - pb.diskon / 100);
    const indikasi_sewa_m2 = after_diskon / pb.luas_tanah;
    return {
      ...pb,
      unit_perbandingan: {
        unit: pb.unit || "m²",
        mata_uang: pb.mata_uang || "IDR",
        harga_penawaran: pb.harga_penawaran,
        diskon: pb.diskon,
        indikasi_sewa: after_diskon,
        indikasi_sewa_m2: parseFloat(indikasi_sewa_m2.toFixed(0)),
        indikasi_sewa_rp: rupiah(after_diskon),
        indikasi_sewa_m2_rp: rupiah(indikasi_sewa_m2),
      },
    };
  });
}

module.exports = calculatePembanding;
