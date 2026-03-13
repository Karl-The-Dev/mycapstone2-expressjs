const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// const passport = require('passport');
// require('../passport');
							
const { verify, verifyAdmin, isLoggedIn} = require("../auth")


// add router here ------------------------------------

router.post("/checkout", verify, orderController.checkoutOrder);

router.get("/my-orders", verify, orderController.myOrders);

router.get("/all-orders", verify, verifyAdmin, orderController.allOrders);

// end router here ------------------------------------



module.exports = router;