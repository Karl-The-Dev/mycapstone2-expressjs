const jwt = require("jsonwebtoken");

// use dotenv in this js file
require('dotenv').config();

// add " JWT_SECRET_KEY = "MyApp2026CourseBookingAPI" " in the .env file

module.exports.createAccessToken = (user) => {

	// payload
	const data = {
		id : user._id,
		email: user.email,
		isAdmin : user.isAdmin || false // Make sure this has a default
	}

	return jwt.sign(data, process.env.JWT_SECRET_KEY);
}

//[IMPORTANT] Token Verification ------------------------------------------------------------

module.exports.verify = (req, res, next) => {
    console.log(req.headers.authorization);

    let token = req.headers.authorization;

    // this checks if the token is valid or not
    if(typeof token === "undefined"){
        return res.send({ auth: "Failed. No Token" });
    } else {
        console.log(token);
        //Bearer Token ejdlaskfndlskfjlksd
        // slice removes the "Bearer" literal keyword in front of the token, so that the pure token is extracted
        token = token.slice(7, token.lenght);
        console.log(token);


        //[SECTION] Token decryption

        // this checks the sliced 'token' above
        jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decodedToken){
            if(err) {
                return res.send({
                    auth: "Failed",
                    message: err.message
                });
            } else {
                console.log("Result from verify method:")
                console.log(decodedToken);

                req.user = decodedToken;

                next();
            }
        })

    }
}

//[IMPORTANT] Token Verification ------------------------------------------------------------

//[SECTION] Verify Admin ------------------------------------------------------------

module.exports.verifyAdmin = (req, res, next) => {
    if(req.user.isAdmin) {
        next();
    } else {
                    // s47 status 403 forbidden
        return res.status(403).send({
            auth: "Failed",
            message: "Action Forbidden"
        })
    }
}
//[SECTION] Verify Admin ------------------------------------------------------------

// ERROR HANDLING -------------------------------------------------------------------
module.exports.errorHandler = (err, req, res, next) => {

    console.error(err);

    const errorMessage = err.message || "Internal Server Error";

    // s47 get status() 
    const statusCode = err.status || 500

        // add status().send()
    res.status(statusCode).json({
        error : {
            message: errorMessage,
            errorCode: err.code || "SERVER_ERROR",
            details : err.details || null
        }
    })

}
// ERROR HANDLING -------------------------------------------------------------------

//[SECTION] Middleware to check if the user is authenticated
module.exports.isLoggedIn = (req, res, next) => {

    // if you want to see the token provided by google
    // the req.user here is from google
    // console.log(req.user)

    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}
