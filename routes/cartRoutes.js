const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");
const customerController = require("../controllers/customerController");

router.post("/addItemToCart",customerController.protect, cartController.addItemToCart);

module.exports = router;