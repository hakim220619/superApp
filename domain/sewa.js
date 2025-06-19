const {
  calculateElementPembanding,
  calculateKarakterFisik,
  calculateSummary,
} = require("../service/core/calculateElementPembanding");
const calculatePembanding = require("../service/core/calculatePembanding");
const {
  getSewaById,
  getTanahByIds,
  getBangunanByIds,
  getPembandingByIds,
  getPersenPenyesuaian,
} = require("../service/main_service/models/sewaModel");

const findSewaReport = async (id) => {
  try {
    const sewa = await getSewaById(id);
    const tanahIds = sewa.tanah_id || [];
    const bangunanIds = sewa.bangunan_id || [];
    const pembandingIds = sewa.pembanding_id || [];
    const tanahs = await getTanahByIds(tanahIds);
    const bangunans = await getBangunanByIds(bangunanIds);
    const pembandings = await getPembandingByIds(pembandingIds);
    const pembandingsFix = calculatePembanding(pembandings);
    const persen = await getPersenPenyesuaian(id);
    const elementPembanding = calculateElementPembanding(
      tanahs,
      bangunans,
      pembandingsFix,
      persen
    );
    const karakterFisik = calculateKarakterFisik(
      tanahs,
      bangunans,
      pembandingsFix,
      persen
    );
    const summary = calculateSummary(tanahs, bangunans, pembandingsFix, persen);
    return {
      sewa,
      tanahs: tanahs.map((tanah) => ({
        ...tanah,
        luas_tanah: tanah.luas_tanah_m2 || 0,
        elevasi: tanah.elevasi_terhadap_jalan_m || 0,
      })),
      bangunans,
      pembandings: pembandingsFix,
      elemen_perbandingan: elementPembanding,
      karakter_fisik: karakterFisik,
      summary: summary,
    };
  } catch (error) {
    console.error("Error fetching sewa report:", error);
    throw new Error("Error fetching sewa report: " + error.message);
  }
};

module.exports = {
  findSewaReport,
};
