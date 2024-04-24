const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const auth = require("../middleware/authentification"); // Assuming you have authentication middleware

// Get All Users
router.get("/", auth, UserController.getAllUsers);

// Update User
router.put("/:id", auth, UserController.updateUser);

// Delete User
router.delete("/:id", auth, UserController.deleteUser);

module.exports = router;
