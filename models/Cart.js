const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
	userId: {
		type: String,
		required: [true, "User ID is Required"]
	},
	cartItems: [
		{
			productId: {
				type: String,
				required: [true, "Product ID is Required"]
			},
			quantity: {
				type: Number,
				required: [true, "Quantity is Required"]
			},
			subtotal: {
				type: Number,
				required: [true, "totalPrice is Required"]
			}
		}
	],
	totalPrice: {
		type: Number,
		required: [true, "totalPrice is Required"]
	},
	orderedOn: {
		type: Date,
		default: Date.now // current date
	}
})
								
module.exports = mongoose.model("Cart", cartSchema)