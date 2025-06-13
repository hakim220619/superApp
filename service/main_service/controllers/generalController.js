const General = require('../models/generalModel');
const response = require('../../../config/helpers/response');

const getAllObject = async (req, res) => {
    try {
        const sewaList = await General.getAllObject();
        response.success(res, 'Data General berhasil diambil', sewaList);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};
const getAllPembanding = async (req, res) => {
    try {
        const sewaList = await General.getAllPembanding();
        response.success(res, 'Data General berhasil diambil', sewaList);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};


module.exports = {
    getAllObject,
    getAllPembanding
};
