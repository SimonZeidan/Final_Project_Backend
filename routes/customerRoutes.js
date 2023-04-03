const express = require('express');
const router = express.Router();

const customerController = require('../controllers/customerController');

router.post('/signup', customerController.signup);
router.post('/login', customerController.login);
router.post('/makeOrder',customerController.protect, customerController.makeOrder);
router.get("/getCustomer/:customerId",customerController.protect, customerController.getCustomer);

router.post("/forgotPassword", customerController.forgotPassword);
router.patch("/resetPassword/:token", customerController.resetPassword);

module.exports = router;