const Order = require("../models/Order");

const auth = require("../auth");

// added to get cart information
const Cart = require("../models/Cart");

const {errorHandler } = require("../auth");

// add CONTROLLERS HERE ---------------------------------------------


// My ORDERS
// module.exports.myOrders = (req, res) => {

// 	const userId = req.user.id;

//     return Order.findOne( { userId } )
//     .then(order => {
//         if (!order) {
//             return res.status(404).send({ error: "Order not found"});
//         }

//         return res.status(200).send ({ orders: order });
//     })

//     .catch(err => errorHandler(err, req, res));
// }

module.exports.myOrders = (req, res) => {

    const userId = req.user.id;

    return Order.find({ userId })  
    .then(orders => {  
        if (!orders || orders.length === 0) {  
            return res.status(404).send({ message: "Order not found"});
        }

        return res.status(200).send({ 
			success: true,
			message: "Orders successfully found!",
			orders: orders
		 });
    })
    .catch(err => errorHandler(err, req, res));
}


// ALL ORDERS
module.exports.allOrders = (req, res) => {

	const userId = req.user.id;

    return Order.find( { } )
    .then(order => {
        if (!order) {
            return res.status(404).send({ error: "Order not found"});
        }

        return res.status(200).send ({ orders: order });
    })

    .catch(err => errorHandler(err, req, res));
}


// CHECKOUT ORDER

module.exports.checkoutOrder = async (req, res) => {

	try{ // try catch ------------------------------------------------------------------

		const userId = req.user.id;


		// find the user cart --------------------------
		const cart = await Cart.findOne({ userId });

		if (!cart){
			return res.status(404).send({
				success: false,
				message: "No cart found!"
			})
		}

		// if found, transfer the information -----------
		let order = new Order({
			userId,
			productsOrdered: cart.cartItems,
			totalPrice: cart.totalPrice
		})

		// save to the database -----------
		await order.save();
		
			 

		//delete the cart once transferred ----------
		return Cart.deleteOne( { userId } )
		.then(clearCart => {
		    if (!clearCart) {
		        return res.status(404).send({ 
		            success: false,
		            error: "No Items to Checkout"
		        });
		    }

		    return res.status(200).send({
				status: true,
				message: "Orded successfully",
				order: clearCart 
		    });

		}).catch(err => errorHandler(err, req, res));
		

	}
	// try catch ------------------------------------------------------------------
	catch (error) {
        return errorHandler(error, req, res);
    }
}


// end CONTROLLERS HERE ---------------------------------------------

