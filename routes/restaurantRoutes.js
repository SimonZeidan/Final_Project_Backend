const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const restaurantController = require('../controllers/restaurantController');
const customerController = require("../controllers/customerController");

router.post('/signup', restaurantController.signup);
router.post('/login', restaurantController.login);

router.get("/getRestaurants",customerController.protect, restaurantController.getRestaurants);
router.get("/getRestaurant/:restaurantUserName",customerController.protect,restaurantController.getRestaurant);

router.post("/addMenu",upload.single('imageFile'),restaurantController.protect, restaurantController.addMenu);

router.get("/getMenus/:restaurantId",customerController.protect, restaurantController.getMenus);
router.post("/getMenu",customerController.protect, restaurantController.getMenu);
router.get("/getMenuItems/:restaurantId/:menuId",customerController.protect, restaurantController.getMenuItems);

router.post("/addItemToMenu",restaurantController.protect, restaurantController.addItemToMenu);
router.get("/searchRestaurant/:restaurantName",customerController.protect, restaurantController.searchRestaurant);

router.patch("/uploadRestaurantImage",upload.single('imageFile'), restaurantController.protect, restaurantController.uploadRestaurantImage)

router.post("/forgotPassword", restaurantController.forgotPassword);
router.patch("/resetPassword/:token", restaurantController.resetPassword);

module.exports = router;