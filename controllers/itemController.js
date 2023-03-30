const Item = require("../models/itemModel");
const sharedController = require("./sharedController");



exports.createItem = async (req, res) => {

    try {
        const item = await Item.findOne({name: req.body.itemName});
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
                imageUrl: imageUrl
            });
            await newItem.save();
            res.status(201).json({message: "Item Created Successfully!!", data: newItem});
        }
        else{
            const newItem = await Item.create({
                name: req.body.itemName,
                price: req.body.price,
                description: req.body.description
            });
            res.status(201).json({message: "Item Created Successfully!!", data: newItem});
        }      
    }catch (err){
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
        console.log(err);
        
    }
}