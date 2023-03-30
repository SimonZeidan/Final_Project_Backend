const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");

router.post("/addItemToCart", cartController.addItemToCart);

module.exports = router;