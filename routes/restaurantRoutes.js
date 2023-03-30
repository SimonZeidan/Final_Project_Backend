const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const restaurantController = require('../controllers/restaurantController');

router.post('/signup', restaurantController.signup);
router.post('/login', restaurantController.login);
router.get("/getRestaurants", restaurantController.getRestaurants);
router.get("/getRestaurant/:restaurantUserName", restaurantController.getRestaurant);
router.post("/addMenu",upload.single('imageFile'), restaurantController.addMenu);
router.get("/getMenus/:restaurantId", restaurantController.getMenus);
router.post("/getMenu", restaurantController.getMenu);
router.get("/getMenuItems/:restaurantId/:menuId", restaurantController.getMenuItems);

router.post("/addItemToMenu", restaurantController.addItemToMenu);
router.get("/searchRestaurant/:restaurantName", restaurantController.searchRestaurant);

module.exports = router;