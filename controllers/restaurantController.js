const Restaurant = require('../models/restaurantModel');
const validator = require('validator');
const Menu = require("../models/menuModel");
const Item = require("../models/itemModel");
const { text } = require('express');

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
      res.status(201).json({message: "Sign up successfully", data: {newRestaurant}});
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
  
      res.status(201).json({message: "Login successfully", data: {restaurant}});
    } catch (err) {
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
      console.log(err);
      
    }
  }

  exports.getRestaurants = async (req, res) => {
    try{
      const restaurants = await Restaurant.find();
      return res.status(200).json({data: restaurants});
    }catch(err){
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
      console.log(err);      
    }
  }

  exports.searchRestaurant = async(req, res) =>{
    try {
      const searchKey = req.params.restaurantName;
      const restaurants = await Restaurant.find({name: new RegExp(searchKey, 'i')});
      
      res.status(200).json({data: restaurants});
      
    } catch (err) {
      console.log(err);      
    }
  }