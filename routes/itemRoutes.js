const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const restaurantController = require("../controllers/restaurantController");
const customerController =require("../controllers/customerController");

const itemController = require("../controllers/itemController");

router.post("/createItem",upload.single('imageFile'),restaurantController.protect, itemController.createItem);
router.get("/getItem/:itemId",customerController.protect, itemController.getItem);
router.get("/getItems/:restaurantId", restaurantController.protect, itemController.getItems);

module.exports = router;