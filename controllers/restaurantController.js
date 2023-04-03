const Restaurant = require('../models/restaurantModel');
const validator = require('validator');
const Menu = require("../models/menuModel");
const Item = require("../models/itemModel");
const {signToken, sendMail} = require("./sharedController");
const {promisify} = require("util");
const jwt = require("jsonwebtoken");


const createSendToken = (restaurant, statusCode, res, message) => {
  const token = signToken(restaurant._id);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      message,
      restaurant,
    },
  });
};

exports.signup = async (req, res) => {
    try {
      const restaurantCheck = await Restaurant.findOne({$or:[{ userName: req.body.userName }, {email: req.body.email}]});
  
      if (restaurantCheck) {
        return res
          .status(409)
          .json({ message: "The restaurant is already in use" });
      }
  
      if (!validator.isEmail(req.body.email)) {
        return res
          .status(400)
          .json({ message: "Please enter a valid email address" });
      }
  
      if (req.body.password !== req.body.passwordConfirm) {
        return res.status(400).json({ message: "Passwords does not match" });
      }
  
      const newRestaurant = await Restaurant.create({
        name: req.body.name,
        email: req.body.email,
        userName: req.body.userName,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        phoneNumber: req.body.phoneNumber,
        website: req.body.website,
        openingHours: req.body.openingHours,
        address: req.body.address
      });
      // res.status(201).json({message: "Sign up successfully", data: {newRestaurant}});
      const message = "Sign up successfully!!";
      createSendToken(newRestaurant, 201, res, message);
    } catch (err) {
      res.status(400).json({ message: err.message });
      console.log(err);
    }
  };

  exports.login = async (req, res) => {
    try {
      const { userName, password, email } = req.body;
  
      const restaurant = await Restaurant.findOne({$or:[{  userName},{email }]});
  
      if (!restaurant || !(await restaurant.checkPassword(password, restaurant.password))) {
        return res.status(401).json({ message: "Incorrect email or password" });
      }
  
      // res.status(201).json({message: "Login successfully", data: {restaurant}});
      const message = "Login successfully!!";

      createSendToken(restaurant, 200, res, message);
    } catch (err) {
      res.status(400).json({ message: err.message });
      console.log(err);
    }
  };

  exports.getRestaurant = async (req, res) =>{
    try {
      const restaurant = await Restaurant.findOne({userName: req.params.restaurantUserName});
      if(!restaurant){
        res.status(401).json({message: "Restaurant not found!"});
      }
      res.status(200).json({data: restaurant});
    } catch (err) {
      res.status(400).json({ message: err.message });
      console.log(err);
      
    }
  }

  exports.getRestaurants = async (req, res) => {
    try{
      const restaurants = await Restaurant.find();
      return res.status(200).json({data: restaurants});
    }catch(err){
      res.status(400).json({ message: err.message });
      console.log(err);
    }
  }

  exports.addMenu = async(req, res) => {
    try {
      const menu = await Menu.findOne({title: req.body.title});
      const restrauant = await Restaurant.findById(req.body.restaurantId)
      const menuItems = req.body.menuItemsIds;
      if (!restrauant){
         return res.status(401).json({message: "Restaurant is not found!"});
      }
      if(menu){
        return res.status(401).json({message: "Menu already exits add it to the restaurant"})
      }
      if(req.file && req.body.imageName){
        const menuImageUrl = await sharedController.uploadImage(req.file);
        if(!menuImageUrl){
          return res.status(400).json({ message: "Error in uploading the image"});
        }
      
      const newMenu = await Menu.create({
        title: req.body.title,
        menuPicture: menuImageUrl,
        restaurant: req.body.restaurantId,
        menuItems
      });
      return res.status(201).json({message: "Menu created Successfully!", data: newMenu});
    }
    const newMenu = await Menu.create({
      title: req.body.title,
      restaurant: req.body.restaurantId,
      menuItems
    });
    res.status(201).json({message: "Menu created Successfully!", data: newMenu});
    }catch(err){
      res.status(400).json({ message: err.message });
      console.log(err);
    }
  }

  exports.getMenus = async( req, res) => {
    try{
      // get the restaurant from the params
      const restaurant = await Restaurant.findById(req.params.restaurantId);
        if(!restaurant){
          return res.status(401).json({message: "Restaurant has been removed!"});
        }
        const menu = await Menu.find({restaurant: req.params.restaurantId});
        if(!menu){
          return res.status(401).json({message: "Menu not found!"});
        }
        return res.status(200).json({data: menu});
    }catch(err){
      res.status(400).json({ message: err.message });
      console.log(err)
    }
  }

  exports.getMenu = async (req, res) => {
    try {
      const restaurant = await Restaurant.findById(req.body.restaurantId);
      if(!restaurant){
        return res.status(401).json({message: "Restaurant has been removed!"});
      }
      const menu = await Menu.findById(req.body.menuId);
      if(!menu){
        return res.status(401).json({message: "Menu not found!"});
      }
      return res.status(200).json({data: menu});
    } catch (err) {
      res.status(400).json({ message: err.message });
      console.log(err);
    }
  }

  exports.getMenuItems = async(req,res) =>{
    try{
      const menu = await Menu.findById(req.params.menuId);
      const restaurant = await Restaurant.findById(req.params.restaurantId);
      if(!(restaurant && menu)){
        return res.status(401).json({message: "Error occured while returning items"});
      }
      const items = await Promise.all(menu.menuItems.map((itemId) => {
        return Item.findById(itemId);
        })
      )
      res.status(200).json({data: items});   
    }catch(err){
      res.status(400).json({ message: err.message });
      console.log(err);
    }
  }

  exports.addItemToMenu = async(req, res) => {
    try {
      const restaurant = await Restaurant.findById(req.body.restaurantId);
      const menu = await Menu.findById(req.body.menuId);
      const menuItemId = req.body.menuItemId;
      
      if(!(restaurant && menu)){
        return res.status(401).json({message: "Error occured while adding the item"});
      }
      const item = await Item.findById(menuItemId);
      if(!item){
        return res.status(401).json({message: "Item not found!"});
      }
      const updatedItem = await menu.updateOne({
        $push: {menuItems: menuItemId}
      });
      res.status(200).json({message: "Item added to the menu successfully!"})
    } catch (err) {
      res.status(400).json({ message: err.message });
      console.log(err);      
    }
  }

  exports.searchRestaurant = async(req, res) =>{
    try {
      const searchKey = req.params.restaurantName;
      const restaurants = await Restaurant.find({name: new RegExp(searchKey, 'i')});
      
      res.status(200).json({data: restaurants});
      
    } catch (err) {
      res.status(400).json({ message: err.message });
      console.log(err);      
    }
  }

  exports.uploadRestaurantImage = async (req, res) => {
    try {
      const restaurant = await Restaurant.findById(req.body.restaurantId);
        if(!restaurant){
            return res.status(400).json({ message: "Restaurant doesn't exits!"});
        }
        if(req.file && req.body.imageName){
          const imageUrl = await sharedController.uploadImage(req.file);
              console.log(imageUrl);
              if(!imageUrl){
                  return res.status(400).json({ message: "Error in uploading the image"});
              }
            
          req.restaurant = await Restaurant.findByIdAndUpdate(req.restaurant._id, {
            restaurantImageUrl: imageUrl});
        return res.status(200).json({ message: "Image uploaded successfully" });
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
      console.log(err); 
    }
  }

  exports.protect = async (req, res, next) => {
    try {
      // check if the restaurant token exist
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
      const currentRestaurant = await Restaurant.findById(decoded.id);
  
      if (!currentRestaurant) {
        return res.status(401).json({
          message: "The restaurant belonging to this token does no longer exist.",
        });
      }
  
      // check if the restaurant changed the password after the token was created
      if (currentRestaurant.passwordChangedAfterTokenIssued(decoded.iat)) {
        return res.status(401).json({
          message: " Your password has been changed recently. Please login again",
        });
      }
  
      // Add the valid logged in user to other requests
      req.restaurant = currentRestaurant;
  
      next();
    } catch (err) {
      console.log(err);
    }
  };

  exports.forgotPassword = async (req, res) => {
    try {
      // find if the user with the provided email exists
      const restaurant = await Restaurant.findOne({ email: req.body.email });
      if (!restaurant) {
        return res
          .status(404)
          .json({ message: " The user with the provided email does not exist" });
      }
  
      // Create the random token
      const resetToken = restaurant.generatePasswordResetToken();
      await restaurant.save({ validateBeforeSave: false });
  
      // send the token via email
  
      const url = `${req.protocol}://${req.get(
        "host"
      )}/api/restaurant/resetPassword/${resetToken}`;
      const msg = `Forgot your Password ? Reset it by visting the following link: ${url}`;
  
      try {
        await sendMail({
          email: restaurant.email,
          subject: "Your Password Reset Token (valid for 10 min)",
          message: msg,
        });
        res.status(200).json({
          status: "success",
          message:
            " The Reset token was successfully sent to your email address.",
        });
      } catch (err) {
        restaurant.passwordResetToken = undefined;
        restaurant.passwordResetExpires = undefined;
        await restaurant.save({ validateBeforeSave: false });
  
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
  
      const restaurant = await Restaurant.findOne({
        passwordResetToken: hashtoken,
        passwordResetExpires: { $gt: Date.now() },
      });
  
      if (!restaurant) {
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
  
      restaurant.password = req.body.password;
      restaurant.passwordConfirm = req.body.passwordConfirm;
      restaurant.passwordResetToken = undefined;
      restaurant.passwordResetExpires = undefined;
  
      await restaurant.save();
  
      createSendToken(restaurant, 200, res);
    } catch (err) {
      console.log(err);
    }
  };