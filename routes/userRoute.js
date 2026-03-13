const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// const passport = require('passport');
// require('../passport');
							
const { verify, verifyAdmin, isLoggedIn} = require("../auth")


// add router here ------------------------------------

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/details", verify, userController.getProfile);

router.patch("/:userId/set-as-admin", verify, verifyAdmin, userController.setAsAdmin);

router.patch("/update-password", verify, userController.updatePassword);

// end router here ------------------------------------



// GOOGLE LOG IN ----------------------------------------

// router.get('/google',
//     passport.authenticate('google', {
//         scope: ['email', 'profile'],
//         prompt: "select_account"
//     })
// );

// router.get('/google/callback',
//     passport.authenticate('google', {
//         failureRedirect: '/users/failed',
//     }),
//     function (req, res) {
//         res.redirect('/users/success')
//     }
// );

// router.get("/failed", (req, res) => {
//     console.log('User is not authenticated');
//     res.send("Failed")
// })


// //[SECTION] Route for successful Google OAuth authentication
// router.get("/success",isLoggedIn, (req, res) => {
//     console.log('You are logged in');
//     console.log(req.user);
//     res.send(`Welcome ${req.user.displayName}`)
// })

// router.get("/logout", (req, res) => {
// 		// session is created as a teemporary database
//     req.session.destroy((err) => {
//         if (err) {
//             console.log('Error while destroying session:', err);
//         } else {
//             req.logout(() => {
//                 console.log('You are logged out');
//                 res.redirect('/');
//             });
//         }
//     });
// });
// GOOGLE LOG IN ----------------------------------------


module.exports = router;