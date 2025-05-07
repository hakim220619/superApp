const User = require('../models/usersModel');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll(req.db);
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error', err });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(req.db, id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', err });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;
    try {
        const updated = await User.update(req.db, id, { username });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Update failed', err });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await User.remove(req.db, id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: 'Delete failed', err });
    }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
