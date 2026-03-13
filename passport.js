require('dotenv').config();
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('./models/User'); // Add this at the top of passport.js
const bcrypt = require("bcrypt");


// GoogleStrategy is primarily for configuring OAuth credentials and handling Google login flow
passport.use(new GoogleStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: "http://localhost:4000/users/google/callback",
    passReqToCallback: true
},


/*
profile - ✅ Required
Contains the user’s info like name, email, and profile picture. Needed to store user data in session/database.

done - ✅ Required	Passport callback — you must call this to complete authentication.

request	- Optional - 	Only if you need the HTTP request inside the callback (e.g., linking Google login to an existing session or user account).
accessToken - 	Optional	- Only if your app needs to call Google APIs on the user’s behalf (like Gmail or Drive).
refreshToken -	Optional - Only if your app needs long-term access to Google APIs without re-login.
*/

function(request, accessToken, refreshToken, profile, done) {
    // return done(null, profile);
        // Find or create user in database
    User.findOne({ email: profile.emails[0].value })
        .then(user => {
            if (user) {
                // User exists, return them
                return done(null, user);
            } else {
                // Create new user from Google profile
                const newUser = new User({
                    googleId: profile.id,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName || '',
                    email: profile.emails[0].value,
                    // Generate a random password since they'll use Google login
                    password: bcrypt.hashSync(Math.random().toString(36), 10),
                    mobileNo: '00000000000', // Placeholder, they can update later
                    isAdmin: false
                });
                
                return newUser.save()
                    .then(savedUser => done(null, savedUser))
                    .catch(err => done(err, null));
            }
        })
        .catch(err => done(err, null));
}
));

// login → serialize → session → deserialize → req.user
// serializeUser → saves the logged-in user’s info in your server session.
passport.serializeUser(function(user, done) {
    done(null, user);
});

// deserializeUser → reads that info from the session and makes it available as req.user on every request.
passport.deserializeUser(function(user, done) {
    done(null, user);
});

