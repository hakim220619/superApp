const { queryOne, queryAll, queryInsertAndGet, queryExecute } = require('../../../config/helpers/helpers');

const getAllObject = async () => {
    return await queryAll(`SELECT t.id, t.judul_penilaian as name, t.jenis_aset as jenis_object FROM object t`);
};
const getAllPembanding = async () => {
    return await queryAll(`SELECT p.id, p.jenis_property as name FROM pembanding p
`);
};
const getUmurEkonomis = async () => {
    return await queryAll(`SELECT uk.id, uk.tahun, uk.type FROM umur_ekonomis uk
`);
};
const getMasterJenisBangunan = async () => {
    return await queryAll(`SELECT uk.id, uk.name, uk.tahun, uk.type FROM master_jenis_bangunan uk
`);
};



module.exports = {
    getAllObject,
    getAllPembanding,
    getUmurEkonomis,
    getMasterJenisBangunan
};
