const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// const passport = require('passport');
// const session = require('express-session');

// add ROUTES here -----------------------------

const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const cartRoute = require("./routes/cartRoute");
const orderRoute = require("./routes/orderRoute");

// end ROUTES here -----------------------------

					
require("dotenv").config(); // imports dotenv package and allow reading of environment files
const app = express(); // creating an express server application
app.use(express.json()); // [IMPORTANT] parse the json data

// [IMORTANT] use cors package ---------------------
const corsOptions = {
	
	origin: ["http://localhost:5173",
		"http://localhost:4000",
		"https://mycapstone2-expressjs.onrender.com",
		"https://mycapstone3-vuejs.vercel.app"
	],
	credentials: true,
	optionsSuccessStatus: 200
}

// activate the corsOptions
app.use(cors(corsOptions));

// ---------------------------------------------------

// [IMORTANT] Connect to DB------------------------------------------
mongoose.connect(process.env.MONGODB_STRING);
mongoose.connection.once("open", () => console.log("Now connected to MongoDB Atlas."))
// [IMORTANT] Connect to DB------------------------------------------


// add base path for routes here -----------------------------

app.use("/users", userRoute);
app.use("/products", productRoute);
app.use("/cart", cartRoute);
app.use("/orders", orderRoute);

// end base path for routes here -----------------------------


if (require.main === module){
				
	app.listen(process.env.PORT, () => console.log(`Server running at port ${process.env.PORT || 3000}`))
}

module.exports = {app, mongoose};
