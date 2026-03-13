const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// const passport = require('passport');
// require('../passport');
							
const { verify, verifyAdmin, isLoggedIn} = require("../auth")


// add router here ------------------------------------

router.post("/", verify, verifyAdmin, productController.createProduct);

router.get("/all", verify, verifyAdmin, productController.getAllProduct);

router.get("/active", productController.getActiveProduct);

router.get("/:productId", productController.getOneProduct);

router.patch("/:productId/update", verify, verifyAdmin, productController.updateProduct);

router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);

router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);

router.post("/search-by-name", productController.searchByName);

router.post("/search-by-price", productController.searchByPrice);



// end router here ------------------------------------



module.exports = router;