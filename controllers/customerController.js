const Customer = require('../models/customerModel');
const validator = require('validator');
const Order = require('../models/orderModel');
const {promisify} = require("util");
const jwt = require("jsonwebtoken");
const {signToken, sendMail} = require("./sharedController");



const createSendToken = (customer, statusCode, res) => {
  const token = signToken(customer._id);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      customer,
    },
  });
};


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
      // res.status(201).json({message: "Sign up successfully", data: {newCustomer}});
      createSendToken(newCustomer, 201, res);
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
      // res.status(200).json({message: "Login successfully", data: {customer}});
      createSendToken(customer, 200, res);
    } catch (err) {
      res.status(400).json({ message: err.message });
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
      res.status(400).json({ message: err.message });
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
      res.status(400).json({ message: err.message });
      console.log(err);
    }
  }

  exports.protect = async (req, res, next) => {
    try {
      // check if the customer token exist
      let token;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      }
  
      if (!token) {
        return res.status(401).json({
          message: "You are not logged in - Please log in to get access",
        });
      }
  
      // token verification
      let decoded;
      try {
        decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      } catch (error) {
        if (error.name === "JsonWebTokenError") {
          return res
            .status(401)
            .json({ message: "Invalid token. Please log in" });
        } else if (error.name === "TokenExpiredError") {
          return res.status(401).json({
            message: "Your session token has expired !! Please login again",
          });
        }
      }
  
      // check if user still exists
      const currentCustomer = await Customer.findById(decoded.id);
  
      if (!currentCustomer) {
        return res.status(401).json({
          message: "The customer belonging to this token does no longer exist.",
        });
      }
  
      // check if the user changed the password after the token was created
      // iat = time the token was issued
      if (currentCustomer.passwordChangedAfterTokenIssued(decoded.iat)) {
        return res.status(401).json({
          message: " Your password has been changed recently. Please login again",
        });
      }
  
      // Add the valid logged in customer to other requests
      req.customer = currentCustomer;
  
      next();
    } catch (err) {
      console.log(err);
    }
  };

  exports.forgotPassword = async (req, res) => {
    try {
      // find if the user with the provided email exists
      const customer = await Customer.findOne({ email: req.body.email });
      if (!customer) {
        return res
          .status(404)
          .json({ message: " The customer with the provided email does not exist" });
      }
  
      // Create the random token
      const resetToken = customer.generatePasswordResetToken();
      await customer.save({ validateBeforeSave: false });
  
      // send the token via email
  
      const url = `${req.protocol}://${req.get(
        "host"
      )}/api/customer/resetPassword/${resetToken}`;
      const msg = `Forgot your Password ? Reset it by visting the following link: ${url}`;
  
      try {
        await sendMail({
          email: customer.email,
          subject: "Your Password Reset Token (valid for 10 min)",
          message: msg,
        });
        res.status(200).json({
          status: "success",
          message:
            " The Reset token was successfully sent to your email address.",
        });
      } catch (err) {
        customer.passwordResetToken = undefined;
        customer.passwordResetExpires = undefined;
        await customer.save({ validateBeforeSave: false });
  
        res.status(500).json({
          status: "success",
          message:
            " An error occurred while sending the email. Please try again in a moment",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
  
  exports.resetPassword = async (req, res) => {
    try {
      const hashtoken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
  
      const customer = await Customer.findOne({
        passwordResetToken: hashtoken,
        passwordResetExpires: { $gt: Date.now() },
      });
  
      if (!customer) {
        return res.status(400).json({
          message:
            " The token is invalid or expired. Please submit another request",
        });
      }
  
      if (req.body.password.length < 8) {
        return res.status(400).json({
          message: "Password length must be at least 8 characters",
        });
      }
  
      if (req.body.password !== req.body.passwordConfirm) {
        return res.status(400).json({
          message: "Password and PasswordConfirm does not match",
        });
      }
  
      customer.password = req.body.password;
      customer.passwordConfirm = req.body.passwordConfirm;
      customer.passwordResetToken = undefined;
      customer.passwordResetExpires = undefined;
  
      await customer.save();
  
      createSendToken(customer, 200, res);
    } catch (err) {
      console.log(err);
    }
  };