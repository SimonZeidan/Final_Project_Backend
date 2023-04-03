const Item = require("../models/itemModel");
const sharedController = require("./sharedController");
const Restaurant = require("../models/restaurantModel");


exports.createItem = async (req, res) => {

    try {
        const item = await Item.findOne({name: req.body.itemName});
        const restaurant = await Restaurant.findById(req.body.restaurantId);
        if(!restaurant){
            return res.status(400).json({ message: "Restaurant doesn't exits!"});
        }
        if(item){
            return res.status(400).json({ message: "Item already exits!"});
        }
        if(req.file && req.body.imageName){
            const imageUrl = await sharedController.uploadImage(req.file);
                console.log("-----");
                console.log(imageUrl);
                console.log("-----");
                if(!imageUrl){
                    return res.status(400).json({ message: "Error in uploading the image"});
                }
            const newItem = Item({
                name: req.body.itemName,
                price: req.body.price,
                description: req.body.description,
                restaurant: req.body.restaurantId,
                imageUrl: imageUrl
            });
            await newItem.save();
            res.status(201).json({message: "Item Created Successfully!!", data: newItem});
        }
        else{
            const newItem = await Item.create({
                name: req.body.itemName,
                price: req.body.price,
                restaurant: req.body.restaurantId,
                description: req.body.description
            });
            res.status(201).json({message: "Item Created Successfully!!", data: newItem});
        }      
    }catch (err){
        res.status(400).json({ message: err.message });
        console.log(err);
    }

}

exports.getItem = async( req, res) => {
    try {
        const item = await Item.findById(req.params.itemId);
        if(!item){
            return res.status(401).json({message: "Item not found!"});
        }
        res.status(200).json({data: item});
    } catch (err) {
        res.status(400).json({ message: err.message });
        console.log(err);
        
    }
}

exports.getItems = async( req, res) => {
    try {
        const restaurant = Restaurant.findById(req.body.restaurantId)
        const items = await Item.find({restaurant: req.body.restaurantId});
        if(!restaurant){
            return res.status(400).json({ message: "Restaurant doesn't exits!"});
        }
        res.status(200).json({data: items});
    } catch (err) {
        res.status(400).json({ message: err.message });
        console.log(err);
        
    }
}