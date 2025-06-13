const { queryOne, queryAll, queryInsertAndGet, queryExecute } = require('../../../config/helpers/helpers');

const findAll = async () => {
    return await queryAll(`SELECT t.id, t.judul_penilaian as name, 'Tanah' FROM tanah t
UNION ALL
SELECT b.id, b.nama_bangunan as name, 'Bangunan' FROM bangunan b
`);
};

const findBy = async (id) => {
    return await queryOne('SELECT * FROM sewa WHERE id = ?', [id]);
};


module.exports = {
    findAll,
    findBy,
};
