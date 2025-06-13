const { queryOne, queryAll, queryInsertAndGet, queryExecute } = require('../../../config/helpers/helpers');

const getAllObject = async () => {
    return await queryAll(`SELECT t.id, t.judul_penilaian as name, 'Tanah' as jenis_object FROM tanah t
UNION ALL
SELECT b.id, b.nama_bangunan as name, 'Bangunan' as jenis_object FROM bangunan b
`);
};
const getAllPembanding = async () => {
    return await queryAll(`SELECT p.id, p.jenis_property as name FROM pembanding p
`);
};



module.exports = {
    getAllObject,
    getAllPembanding
};
