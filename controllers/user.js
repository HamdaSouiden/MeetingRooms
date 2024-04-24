const User = require("../models/User");

// Get all users
exports.getAllUsers = async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Update user
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied" });
        }
    
        // Optional: If updating password, hash the new password
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 8);
        }
        delete updates.isAdmin;

        const user = await User.findByIdAndUpdate(id, updates, { new: true });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.status(200).send({ message: "User deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
