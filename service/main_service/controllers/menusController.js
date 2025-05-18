const Menu = require('../models/menusModel');
const response = require('../../../config/helpers/response');


const getAllMenus = async (req, res) => {
    try {
        const menus = await Menu.findAll(req.db);
        response.success(res, 'Menus fetched successfully', menus);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const getMenuById = async (req, res) => {
    const { id } = req.params;
    try {
        const menu = await Menu.findBy(id);
        if (!menu) return response.error(res, 'Menu not found', null, 404);
        response.success(res, 'Menu fetched successfully', menu);
    } catch (err) {
        response.error(res, 'Server error', err);
    }
};

const updateMenu = async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await Menu.update(id, req.body);
        response.success(res, 'Menu updated successfully', updated);
    } catch (err) {
        response.error(res, 'Update failed', err);
    }
};

const deleteMenu = async (req, res) => {
    const { id } = req.params;
    try {
        await Menu.remove(id);
        response.success(res, 'Menu deleted successfully', null, 201);
    } catch (err) {
        response.error(res, 'Delete failed', err);
    }
};

const createMenu = async (req, res) => {
    try {
        const result = await Menu.createMenu(req.body);
        response.success(res, 'Menu created successfully', result, 201);
    } catch (err) {
        response.error(res, 'Insert failed', err);
    }
};

module.exports = {
    getAllMenus,
    getMenuById,
    updateMenu,
    deleteMenu,
    createMenu
};
