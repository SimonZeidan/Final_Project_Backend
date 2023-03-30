const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const itemController = require("../controllers/itemController");

router.post("/createItem",upload.single('imageFile'), itemController.createItem);
router.get("/getItem/:itemId", itemController.getItem);

module.exports = router;