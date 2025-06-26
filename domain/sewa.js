const db = require("../config/db");
const {
  calculateElementPembanding,
  calculateKarakterFisik,
  calculateSummary,
  calculateConclusion,
  calculateFinalSummary,
} = require("../service/core/calculateElementPembanding");
const calculatePembanding = require("../service/core/calculatePembanding");
const {
  getSewaById,
  getTanahByIds,
  getBangunanByIds,
  getPembandingByIds,
  getPersenPenyesuaian,
  createDefaultPersenKarakterFisik,
  loadPersenPenyesuaianFisikFromDB,
  createDefaultElementPerbandingan,
  getTotalPersen,
  getOnePembanding,
} = require("../service/main_service/models/sewaModel");

const findSewaReport = async (id) => {
  try {
    await createDefaultPersenKarakterFisik(id);
    await createDefaultElementPerbandingan(id);
    const sewa = await getSewaById(id);
    const tanahIds = sewa.tanah_id || [];
    const bangunanIds = sewa.bangunan_id || [];
    const pembandingIds = sewa.pembanding_id || [];
    const tanahs = await getTanahByIds(tanahIds);
    const bangunans = await getBangunanByIds(bangunanIds);
    const pembandings = await getPembandingByIds(pembandingIds);
    const pembandingsFix = calculatePembanding(pembandings);
    const persen = await getPersenPenyesuaian(id);
    const persenMapKarakterFisik = await loadPersenPenyesuaianFisikFromDB(id);
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
      persenMapKarakterFisik
    );
    const totalPersen = await getTotalPersen(id);
    const totalPenyesuaianElementPembanding =
      elementPembanding[0]["total_penyesuaian"] || 0;
    const totalPenyesuaiankrakterFisik =
      karakterFisik[0]["total_penyesuaian"] || 0;
    const totalPenyesuaian =
      totalPenyesuaianElementPembanding + totalPenyesuaiankrakterFisik;
    const indikasi_nilai_m2_pembandings = pembandingsFix.map((pembanding) => ({
      indikasi_nilai_m2: pembanding.unit_perbandingan.indikasi_sewa_m2 || 0,
    }));
    const summary = calculateSummary(
      indikasi_nilai_m2_pembandings,
      totalPersen,
      totalPenyesuaian,
      elementPembanding[0]["summary"]["pembanding"],
      karakterFisik[0]["summary"]["pembanding"]
    );
    const conclusions = calculateConclusion(
      pembandingsFix,
      elementPembanding[0]["summary"]["pembanding"],
      karakterFisik[0]["summary"]["pembanding"],
      summary
    );
    const finalSummary = calculateFinalSummary(summary);
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
      conclusions,
      final_summary: finalSummary,
    };
  } catch (error) {
    throw new Error("Error fetching sewa report: " + error.message);
  }
};

const updatePenyesuaianKarakterFisikBySewaId = async (sewaId, data) => {
  try {
    const sewa = await getSewaById(sewaId);
    const tanahIds = sewa.tanah_id || [];
    const bangunanIds = sewa.bangunan_id || [];
    const pembandingIds = sewa.pembanding_id || [];
    const tanahs = await getTanahByIds(tanahIds);
    const bangunans = await getBangunanByIds(bangunanIds);
    const object = {};
    let persen = 0;
    let pembandingLuasTanah = 0;
    const pembanding = await getOnePembanding(data.pembanding_id);
    if (pembanding) {
      pembandingLuasTanah = pembanding.luas_tanah;
    }
    if (tanahs && tanahs.length > 0) {
      object.luas_tanah = tanahs[0]["luas_tanah_m2"];
    }
    if (object.luas_tanah && pembandingLuasTanah) {
      persen =
        ((pembandingLuasTanah - object.luas_tanah) / object.luas_tanah) *
        data.raw_persen;
    }
    await db.query(
      `UPDATE karakter_fisik_penyesuaian SET raw_persen = ?, persen = ? WHERE sewa_id = ? AND label = ? AND pembanding_id = ?`,
      [data.raw_persen, persen, sewaId, data.label, data.pembanding_id]
    );
  } catch (error) {
    throw new Error(
      "Error updating penyesuaian karakter fisik: " + error.message
    );
  }
};

const updatePenyesuaianElemenPerbandingBySewaId = async (sewaId, data) => {
  try {
    const sewa = await getSewaById(sewaId);
    const tanahIds = sewa.tanah_id || [];
    const bangunanIds = sewa.bangunan_id || [];
    const pembandingIds = sewa.pembanding_id || [];
    const tanahs = await getTanahByIds(tanahIds);
    const bangunans = await getBangunanByIds(bangunanIds);
    const object = {};
    let persen = 0;
    let pembandingLuasTanah = 0;
    // const pembanding = await getOnePembanding(data.pembanding_id);
    // if (pembanding) {
    //   pembandingLuasTanah = pembanding.luas_tanah;
    // }
    // if (tanahs && tanahs.length > 0) {
    //   object.luas_tanah = tanahs[0]["luas_tanah_m2"];
    // }
    // if (object.luas_tanah && pembandingLuasTanah) {
    //   persen =
    //     ((object.luas_tanah - pembandingLuasTanah) / pembandingLuasTanah) *
    //     data.raw_persen;
    // }
    console.log("data", data);
    await db.query(
      `UPDATE elemen_perbandingan_penyesuaian SET raw_persen = ?, persen = ? WHERE sewa_id = ? AND label = ? AND pembanding_id = ?`,
      [data.raw_persen, persen, sewaId, data.label, data.pembanding_id]
    );
  } catch (error) {
    throw new Error(
      "Error updating penyesuaian karakter fisik: " + error.message
    );
  }
};
module.exports = {
  findSewaReport,
  updatePenyesuaianKarakterFisikBySewaId,
  updatePenyesuaianElemenPerbandingBySewaId,
};
