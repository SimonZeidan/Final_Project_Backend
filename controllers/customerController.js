const Customer = require('../models/customerModel');
const validator = require('validator');
const Order = require('../models/orderModel');
const Cart = require("../models/cartModel");


exports.signup = async (req, res) => {
    try {
      const emailCheck = await Customer.findOne({ email: req.body.email });
  
      if (emailCheck) {
        return res
          .status(409)
          .json({ message: "The email address is already in use" });
      }
  
      if (!validator.isEmail(req.body.email)) {
        return res
          .status(400)
          .json({ message: "Please enter a valid email address" });
      }
  
      if (req.body.password !== req.body.passwordConfirm) {
        return res.status(400).json({ message: "Passwords does not match" });
      }
  
      const newCustomer = await Customer.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        location: req.body.location,
        phoneNumber: req.body.phoneNumber
      });
      res.status(201).json({message: "Sign up successfully", data: {newCustomer}});
  
      // createSendToken(newCustomer, 201, res);
    } catch (err) {
      res.status(400).json({ message: err.message });
      console.log(err);
    }
  };

  exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const customer = await Customer.findOne({ email });
  
      if (!customer || !(await customer.checkPassword(password, customer.password))) {
        return res.status(401).json({ message: "Incorrect email or password" });
      }
  
      res.status(201).json({message: "Login successfully", data: {customer}});
    } catch (err) {
      console.log(err);
    }
  };

  exports.getCustomer = async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.customerId);
      if(!customer){
        return res.status(401).json({message: "Customer not found!"});
      }

      res.status(200).json({data: customer});
    } catch (err) {
      console.log(err);
    }
  }

  exports.makeOrder = async(req, res) => {
    try{
      if(!(req.body.customerId && req.body.restaurantId && req.body.cartId 
        && req.body.menuIds.length > 0 && req.body.totalPrice)){ 
        return res.status(401).json("Missing data; please try again");
      }
      const newOrder = await Order.create({
        orderOwner: req.body.customerId,
        orderRestaurant: req.body.restaurantId,
        menu: req.body.menuIds,
        cart: req.body.cartId,
        totalPrice: req.body.totalPrice
      })
      res.status(201).json({message: "Order Created successfully", data: {newOrder}});
    }catch(err){
      console.log(err);
    }
  }