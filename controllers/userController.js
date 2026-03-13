const User = require("../models/User");
const bcrypt = require("bcrypt"); // <<
const auth = require("../auth");

const {errorHandler } = require("../auth");

// add CONTROLLERS HERE ---------------------------------------------


module.exports.registerUser = async (req, res) => {
    try {

        // VALIDATIONS FIRST (for 400 errors)

        if (
            typeof req.body.firstName !== "string" ||
            typeof req.body.lastName !== "string"
        ) {
            return res.status(400).send(false);
        }

        if (!req.body.email || !req.body.email.includes("@")) {
            return res.status(400).send({ message: "Invalid email format." });
        }

        if (!req.body.password || req.body.password.length < 8) {
            return res.status(400).send({
                message: "Password must be atleast 8 characters long"
            });
        }

        if (!req.body.mobileNo || req.body.mobileNo.length < 11) {
            return res.status(400).send({
                message: "Mobile number is invalid"
            });
        }

        // DUPLICATE EMAIL CHECK (409)
        const duplicateEmail = await User.findOne({ email: req.body.email });
        if (duplicateEmail) {
            return res.status(409).send({
                message: "Duplicate Email Found!"
            });
        }

        // CREATE USER
        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
            mobileNo: req.body.mobileNo
        });

        const savedUser = await newUser.save();

        return res.status(201).send({ 
            success: true,
            message: "New user successfully registered!"
        });


    } catch (error) {
        return errorHandler(error, req, res);
    }
};

module.exports.loginUser = async (req, res) => {

    if(req.body.email.includes("@")){
        try {
            const result = await User.findOne({ email: req.body.email });

            if (!result) {
               
                return res.status(404).send({
                    // ADDED for RESTful Response
                    success: false,
                    message: "No email found!"
                });
                
            }
           
            const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password); 

            if(isPasswordCorrect){
                
                return res.send({ 
                    // ADDED for RESTful Response
                    success: true,
                    message: "Successfully Logged In!",
                    access: auth.createAccessToken(result) });
            }
            else{
               
                return res.status(401).send({
                    // ADDED for RESTful Response
                    success: false,
                    message: "Wrong password!"
                });
               
            }

        } catch (err) {
             errorHandler(error, req, res);
        }
    }
    else{
        return res.status(400).send({
            // ADDED for RESTful Response
            success: false,
            message: "Incorrect email format!"
        });
        
    }
    
};


module.exports.getProfile = async (req, res) => {
    try {

        
        const user = await User.findById({ _id: req.user.id });

        if (!user) {
                    
            return res.status(404).send ({ 
                
                error: "User not found" });
        }
                    
        return res.status(200).send ({ user: user });

    } catch (err) {
        return res.send ({ message: err.message });
    }
};



module.exports.setAsAdmin = async (req, res) => {
    try {
        if (req.user.isAdmin === false) {
            return res.status(403).send(false);
        }

        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).send({
                message: "User not found"});
        }
        
        if (user.isAdmin) {
            return res.status(200).send({
                message: "User already set as Admin",
                user: user
            });
        }
        
        user.isAdmin = true;

        await user.save();
        return res.status(200).send({
            success: true,
            message: "User has been changed to admin successfully!"
        });
    } catch (error) {
        return errorHandler(error, req, res);
    }
};



module.exports.updatePassword = (req, res) => {

    
    let updatedPassword = {
        password: bcrypt.hashSync(req.body.newPassword, 10)
    }

    
    return User.findOneAndUpdate({ email: req.user.email }, updatedPassword)
    .then(updatedUser => {
        if (updatedUser) {
            res.status(201).send({
                
                message: "Password reset successfully"
            });
        } 
        // else {
        //     res.status(400).send({
        //         success: false,
        //         newPassword: "Password update failed!"
        //     });
        // }
    })
    .catch(error => errorHandler(error, req, res));

}



// end CONTROLLERS HERE ---------------------------------------------
