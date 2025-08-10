const { raw } = require("body-parser");
const db = require("../config/db");
const {
    calculateElementPembanding,
    calculateLokasi,
    calculateKarakterFisik,
    calculateSummary,
    calculateConclusion,
    calculateFinalSummary,
} = require("../service/core/calculateElementPembandingPasar");
const calculatePembanding = require("../service/core/calculatePembanding");
const {
    getPasarById,
    getTanahByIds,
    getBangunanByIds,
    getPembandingByIds,
    getPersenPenyesuaian,
    createDefaultPersenKarakterFisik,
    loadPersenPenyesuaianFisikFromDB,
    createDefaultElementPerbandingan,
    getTotalPersen,
    getOnePembanding,
} = require("../service/main_service/models/pasarModel");

function ObjectDTOResponse(tanah) {
    return {
        ...tanah,
        luas_tanah: tanah.luas_tanah_m2 || 0,
        luas_bangunan: tanah.luas_bangunan_m2 || 0,
        elevasi: tanah.elevasi_terhadap_jalan_m || 0,
    };
}

const findPasarReport = async (id) => {
    try {
        await createDefaultPersenKarakterFisik(id);
        await createDefaultElementPerbandingan(id);
        const pasar = await getPasarById(id);
        const tanahIds = pasar.tanah_id || [];
        const bangunanIds = pasar.bangunan_id || [];
        const pembandingIds = pasar.pembanding_id || [];
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
        const lokasi = calculateLokasi(
            tanahs,
            bangunans,
            pembandingsFix,
            persen
        );
        const karakterFisik = calculateKarakterFisik(
            tanahs,
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
            indikasi_nilai_m2: pembanding.unit_perbandingan.indikasi_pasar_m2 || 0,
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
            pasar,
            tanahs: tanahs.map((tanah) => ObjectDTOResponse(tanah)),
            bangunans,
            pembandings: pembandingsFix,
            elemen_perbandingan: elementPembanding,
            lokasi: lokasi,
            karakter_fisik: karakterFisik,
            summary: summary,
            conclusions,
            final_summary: finalSummary,
        };
    } catch (error) {
        throw new Error("Error fetching pasar report: " + error.message);
    }
};

const calulatePersen = (
    props = {
        pembanding: {},
        tanah: {},
        label: "",
        raw_persen: 0,
    }
) => {
    const { luas_tanah_m2, luas_bangunan_m2 } = props.tanah;
    const { luas_tanah, luas_bangunan } = props.pembanding;
    switch (props.label) {
        case "Luas Tanah":
            return ((luas_tanah - luas_tanah_m2) / luas_tanah_m2) * props.raw_persen;
        case "Luas Bangunan":
            console.log(
                `((${luas_bangunan} - ${luas_bangunan_m2}) / ${luas_bangunan_m2}) * ${props.raw_persen}`
            );
            return (
                ((luas_bangunan - luas_bangunan_m2) / luas_bangunan_m2) *
                props.raw_persen
            );
        default:
            return props.raw_persen;
    }
};

const updatePenyesuaianKarakterFisikByPasarId = async (pasarId, data) => {
    try {
        const pasar = await getPasarById(pasarId);
        const tanahIds = pasar.tanah_id || [];
        const tanahs = await getTanahByIds(tanahIds);
        const pembanding = await getOnePembanding(data.pembanding_id);
        const persen = calulatePersen({
            pembanding: pembanding,
            tanah: tanahs[0],
            label: data.label,
            raw_persen: data.raw_persen,
        });
        await db.query(
            `UPDATE karakter_fisik_penyesuaian SET raw_persen = ?, persen = ? WHERE pasar_id = ? AND label = ? AND pembanding_id = ?`,
            [data.raw_persen, persen, pasarId, data.label, data.pembanding_id]
        );
    } catch (error) {
        throw new Error(
            "Error updating penyesuaian karakter fisik: " + error.message
        );
    }
};

const updatePenyesuaianElemenPerbandingByPasarId = async (pasarId, data) => {
    try {
        const pasar = await getPasarById(pasarId);
        const tanahIds = pasar.tanah_id || [];
        const bangunanIds = pasar.bangunan_id || [];
        const pembandingIds = pasar.pembanding_id || [];
        const tanahs = await getTanahByIds(tanahIds);
        const bangunans = await getBangunanByIds(bangunanIds);
        const object = {};
        let persen = 0;
        let pembandingLuasTanah = 0;
        const pembanding = await getOnePembanding(data.pembanding_id);
        console.log(`Pembanding: ${JSON.stringify(pembanding)}`);
        if (pembanding) {
            pembandingLuasTanah = pembanding.luas_tanah;
        }
        if (tanahs && tanahs.length > 0) {
            object.luas_tanah = tanahs[0]["luas_tanah_m2"];
        }
        console.log(
            `Luas Tanah: ${object.luas_tanah}, Pembanding Luas Tanah: ${pembandingLuasTanah}`
        );
        if (object.luas_tanah && pembandingLuasTanah) {
            persen =
                ((pembandingLuasTanah - object.luas_tanah) / object.luas_tanah) *
                data.raw_persen;
            console.log(
                `(${pembandingLuasTanah} - ${object.luas_tanah}) / ${object.luas_tanah} * ${data.raw_persen} = ${persen}`
            );
        }
        await db.query(
            `UPDATE elemen_perbandingan_penyesuaian SET raw_persen = ?, persen = ? WHERE pasar_id = ? AND label = ? AND pembanding_id = ?`,
            [data.raw_persen, persen, pasarId, data.label, data.pembanding_id]
        );
    } catch (error) {
        throw new Error(
            "Error updating penyesuaian karakter fisik: " + error.message
        );
    }
};

module.exports = {
    findPasarReport,
    updatePenyesuaianKarakterFisikByPasarId,
    updatePenyesuaianElemenPerbandingByPasarId,
    ObjectDTOResponse,
};
