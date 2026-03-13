const Product = require("../models/Product");
const bcrypt = require("bcrypt"); // <<
const auth = require("../auth");

const {errorHandler } = require("../auth");


// add CONTROLLERS HERE ---------------------------------------------

// CREATE PRODUCT
module.exports.createProduct = async (req, res) => {
    try {

        // DUPLICATE PRODUCT CHECK (409)
        const duplicateProduct = await Product.findOne({ name: req.body.name });
        if (duplicateProduct) {
            return res.status(409).send({
                message: "Duplicate Product Found!"
            });
        }

        // CREATE PRODUCT
        const newProduct = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            image: req.body.image,
            category: req.body.category
            
        });

        const savedProduct = await newProduct.save();

        return res.status(201).send({
            success: true,
            message:"Product added successfully!",
            product: savedProduct
        });


    } catch (error) {
        return errorHandler(error, req, res);
    }
};

// GET ALL PRODUCTS
module.exports.getAllProduct = (req, res) => {

    return Product.find({})
    .then(result => {

        if(result.length == 0){
            return res.status(403).send({
            	auth: "Failed",
            	message: "Action Forbidden"
            }) // not found
        }
        else{
            return res.status(200).send(result)
        }
        
   })
   .catch(err => errorHandler(err, req, res));
};


// GET ALL ACTIVE PRODUCTS
module.exports.getActiveProduct = (req, res) => {
    return Product.find({ isActive: true })
    .then(result => {

        if(result.length === 0){
            return res.status(404).send({message: "No active product found"}) 
        }
        else {
            return res.status(200).send(result)
        } 
        
   })
   .catch(err => errorHandler(err, req, res));
};

// GET ONE PRODUCT
module.exports.getOneProduct = (req, res) => {

    Product.findById(req.params.productId)
    .then(product => res.status(200).send(product))
    .catch(error => errorHandler(error, req, res));
    
};

// UPDATE PRODUCT
module.exports.updateProduct = (req, res)=>{

    let updatedProduct = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        image: req.body.image,
        category: req.body.category
    }

    
    return Product.findByIdAndUpdate(req.params.productId, updatedProduct)
    .then(product => {
        if (product) {
            return res.status(200).send({ 
            success: true,
            message: "Product updated successfully"
        });
        } else {
            return res.status(404).send({ error: "Product not found" });
        }
    })
    .catch(error => errorHandler(error, req, res));
};


// ARCHIVE PRODUCT
module.exports.archiveProduct = (req, res) => {

    let updateActiveField = {
        isActive: false
    }

    return Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then(product => {
        if (!product) {
            return res.status(404).send({ error: "Product not found"});
        } 

        if (!product.isActive) {
            return res.status(200).send({
              message: "Product is already archived",
              product: product
            });
        }

        return res.status(200).send({
          success: true,
          message: "Product archived successfully"
        })
    })
    .catch(error => errorHandler(error, req, res));
};


// ACTIVATE
module.exports.activateProduct = (req, res) => {

    let updateActiveField = {
        isActive: true
    }

    return Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then(product => {
        if (!product) {
            return res.status(404).send({ error: "Product not found"});
        } 

        if (product.isActive) {
            return res.status(200).send({
              message: "Product is already active",
              product: product
            });
        }

        return res.status(200).send({
          success: true,
          message: "Product activated successfully"
        })
    })
    .catch(error => errorHandler(error, req, res));
};


// SEARCH BY NAME

module.exports.searchByName = (req, res) => {

    const { name } = req.body;

    if ( name === undefined || name === "") {
    return res.status(400).send({
        message: "Product name is required"
     });
  
  }

    return Product.findOne({ name: name })

    .then(product => {
        if (!product) {
            return res.status(404).send({
                message: "Product not found"
            });
        }

        return res.status(200).send({
            product: product
        });
    })

    .catch(error => errorHandler(error, req, res));
};


// SEARCH BY PRICE

module.exports.searchByPrice = (req, res) => {

    const { minPrice, maxPrice } = req.body;
    

    if ( minPrice === undefined || 
         maxPrice === undefined ||
         minPrice === "" ||
         maxPrice === "" 
        ) {
    return res.status(400).send({
        message: "Min price and Max price are required"
     });

  }

    return Product.find({ 
    price: {
        $gte: minPrice,
        $lte: maxPrice
    }
})

    .then(products => {
        if (products.length === 0) {
            return res.status(404).send({
                message: "No products found"
            });
        }

        return res.status(200).send({
            products
        });
    })

    .catch(error => errorHandler(error, req, res));
};

// end CONTROLLERS HERE ---------------------------------------------
