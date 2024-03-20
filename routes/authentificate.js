const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");



//Register User
router.post("/registre", authController.registre);

//Login User
router.post("/login", authController.login);


module.exports = router;