const Cart = require("../models/cartModel");

exports.addItemToCart = async (req, res) => {
   try {
    const item = {
        item: req.body.itemId,
        quantity: req.body.quantity
    }
    const cart = await Cart.findById(req.body.cartId);
    if(!cart){
        if(req.body.cartId){
            return res.status(500).json({message: "Cart is not found!"})
        }
        const newCart = await Cart.create({
            cartItems: [item]
        });
        return res.status(201).json({message: "Cart created and item added it!", data: newCart});
    }
    else{
        const cartItem = cart.cartItems.find((cartItem) => cartItem.item == item.item)
        const cartItems = cart.cartItems.map((cartItem) => {
            if(cartItem.item == item.item){
                return item;
            }
            return cartItem;
        }) 
        if(cartItem){
            const oldCart = await Cart.findByIdAndUpdate(
                cart._id,
                {$set: {cartItems: cartItems}}
            );
            return res.status(201).json({message: "Cart updated and item qauntity updated!", data: oldCart});
        }
    }
    const updatedCart = await cart.updateOne({$push: {cartItems: item}},{new :true});
    res.status(200).json({message: "Item Added to the cart!",  data: updatedCart});  
   } catch (error) {
    console.log(error);
   }
}