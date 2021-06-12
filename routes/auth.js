const express = require("express");
const router = express.Router();
const passport = require("passport");

router.post("/register-login", (req, res, next) => {
    passport.authenticate("local", function (err, user, info) {
        if (err) {
            return res.status(400).json({ errors: err });
        }
        if (!user) {
            return res.status(401).json({ errors: "Unauthorized" });
        }
        req.logIn(user, function (err) {
            if (err) {
                return res.status(400).json({ errors: err });
            }
            return res.status(200).json({ success: `logged in ${user.id}` });
        });
    })(req, res, next);
});

router.post("/logout", (req, res, next) => {
    req.logout();
    return res.status(200).json({ success: `User logged out` });
});

router.post('/is-authenticated', (req, res, next) => {
    console.log('session ', req.session);
    if (req.isAuthenticated()) {
        console.log('user ', req.session.passport.user);
        return res.status(200).json({ success: `User is authenticated` });
    }
    return res.status(401).json({ "statusCode": 401, "message": "not authenticated" });
});

module.exports = router;