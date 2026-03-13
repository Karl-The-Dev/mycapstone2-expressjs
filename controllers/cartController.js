const Cart = require("../models/Cart");
const bcrypt = require("bcrypt"); // <<
const auth = require("../auth");

// added product for checking
const Product = require("../models/Product");

const {errorHandler } = require("../auth");

// add CONTROLLERS HERE ---------------------------------------------

// GET CART
module.exports.getCart = (req, res) => {

    const userId = req.user.id;

    return Cart.findOne( { userId } )
    .then(cart => {
        if (!cart) {
            return res.status(404).send({ error: "Cart not found"});
        }

        return res.status(200).send ({ cart: cart });
    })

    .catch(err => errorHandler(err, req, res));
}

// ADD TO CART
module.exports.addToCart = async (req, res) => {
    try {
// try catch ------------------------------------------------------------------
        const userId = req.user.id;
        const { productId, price, quantity, subtotal } = req.body;

        // Error handling - Validate required fields
        if (!productId || !price || !quantity || !subtotal) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Error handling - inputs must not be a negative number
        if (productId < 0 || price < 0 || quantity < 0 || subtotal < 0) {
            return res.status(403).json({
                success: false,
                message: "Values must not be a negative number!"                
            });
        }
        
        // Error handling - validate product first if it exists
        let existingProduct = await Product.findById({ _id: productId });

        if(!existingProduct){
            return res.status(403).json({
                success: false,
                message: "Not an existing product"                
            });
        }

        // Convert string values to numbers
        const numPrice = Number(price);
        const numQuantity = Number(quantity);
        const numSubtotal = Number(subtotal);

        
       

        // Find user's cart
        let cart = await Cart.findOne({ userId });
        
        // initialize to get total price, sub total, subtotal*quantity variables
        let finalTotalPrice = 0;
        let finalSubTotal = 0;
        let subTotalSum = 0;


        // If no cart found, create a new one
        if (!cart) {

            // calculate the new inputs right away
            let numSubtotal = Number(quantity) * Number(price);

            cart = new Cart({
                userId,
                cartItems: [{
                    productId,
                    price: numPrice,
                    quantity: numQuantity,
                    subtotal: numSubtotal
                }],
                totalPrice: numSubtotal
            });

            await cart.save();

            return res.status(201).json({
                success: true,
                message: "Item added to cart successfully",
                cart: cart
            });
        }

        // Cart exists - check if product already in cart
        const existingItemIndex = cart.cartItems.findIndex(
            item => item.productId.toString() === productId
        );

        if (existingItemIndex !== -1){

            
            // compute for the price * quantity;
            subTotalSum = Number(price) * Number(quantity);
            
            // Convert string values to numbers
            finalTotalPrice = Number(cart.totalPrice);
            finalSubTotal = Number(cart.cartItems[existingItemIndex].subtotal);

            // compute and save the new values to the database
            cart.cartItems[existingItemIndex].subtotal = finalSubTotal + subTotalSum;
            cart.totalPrice = finalTotalPrice + subTotalSum;
            cart.cartItems[existingItemIndex].quantity += Number(quantity)
            cart.save();

            return res.status(201).json({
                success: true,
                message: "Item added to cart successfully",
                cart: cart
            });
        }

        else {
            // Product doesn't exist in cart - add new item

            // calculate the new inputs right away
            let numSubtotal = Number(quantity) * Number(price);

            cart.cartItems.push({
                productId,
                price: numPrice,
                quantity: numQuantity,
                subtotal: numSubtotal
            });

            // save the new item to the database
            finalTotalPrice = Number(cart.totalPrice)
            cart.totalPrice = finalTotalPrice + numSubtotal

            cart.save();

            return res.status(201).json({
                success: true,
                message: "Item added to cart successfully",
                cart: cart
            });
        }


        
// try catch -------------------------------------------------------
    } catch (error) {
        return errorHandler(error, req, res);
    }
};



// UPDATE CART QUANTITY
module.exports.updateCartQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, newQuantity } = req.body;

        // Validate
        if (!productId || newQuantity === undefined) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        if (newQuantity < 0) {
            return res.status(403).json({ success: false, message: "Quantity must not be negative" });
        }

        // Find product
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Find cart
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        // Find cart item
        const existingItemIndex = cart.cartItems.findIndex(
            item => item.productId.toString() === productId
        );
        if (existingItemIndex === -1) {
            return res.status(404).json({ success: false, message: "Item not found in cart" });
        }

        // ✅ Update quantity and subtotal
        cart.cartItems[existingItemIndex].quantity = Number(newQuantity);
        cart.cartItems[existingItemIndex].subtotal = Number(newQuantity) * existingProduct.price;

        // Recalculate cart totalPrice
        cart.totalPrice = cart.cartItems.reduce((sum, item) => sum + item.subtotal, 0);

        await cart.save(); // ✅ await save

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully",
            cart
        });

    } catch (error) {
        return errorHandler(error, req, res);
    }
}

// GET CART
module.exports.clearCart = (req, res) => {

    const userId = req.user.id;

    return Cart.deleteOne( { userId } )
    .then(clearCart => {
        if (!clearCart) {
            return res.status(404).send({ 
                success: false,
                error: "No Cart not found"
            });
        }

        return res.status(200).send ({ 
            success: true,
            message: "Cart cleared successfully",
            cart: clearCart 
        });

    })

    .catch(err => errorHandler(err, req, res));
}


// REMOVE FROM CART
module.exports.removeFromCart = async (req, res) => {

    try { // try catch -------------------------------------------------------
        const userId = req.user.id;

        let cart = await Cart.findOne({ userId });

        let productId = req.params.productId;

        // Error handling - validate product first if it exists---------------------
        let existingProduct = await Product.findById({ _id: productId });

        if(!existingProduct){
            return res.status(403).json({
                success: false,
                message: "Not an existing product"                
            });
        }// Error handling - validate product first if it exists---------------------
       

       // Find the array of the product
        const existingItemIndex = cart.cartItems.findIndex(
            item => item.productId.toString() === productId
        );

        let updatedCart = "";

        if(cart.totalPrice > 0){
            // subtract the subtotal from the total price
            cart.totalPrice = Number(cart.totalPrice) - Number(cart.cartItems[existingItemIndex].subtotal)
            cart.cartItems[existingItemIndex].quantity = Number(cart.cartItems[existingItemIndex].quantity) - Number(cart.cartItems[existingItemIndex].quantity);

            await cart.save();

            //remove the item
            updatedCart = await Cart.findOneAndUpdate(
                { userId: userId }, // Find the cart belonging to the user
                { $pull: { cartItems: { productId: productId } } }, // Use $pull to remove elements from the 'items' array that match the condition
                { new: true } // Return the updated document
            );

            await cart.save();

        }
        else{
            return res.status(403).send({
                success: false,
                message: "Cart Value must not be more than the Total value"
            })
        }
        

        return res.status(200).send({
            success: true,
            message: "Cart Item Removed",
            cart: updatedCart
            
        })

    }
     catch (error) { // try catch -------------------------------------------------------
        return errorHandler(error, req, res);
    }
}

// end CONTROLLERS HERE ---------------------------------------------