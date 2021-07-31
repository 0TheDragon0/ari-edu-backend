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
            let cookieVal = res.cookie.toString();
            console.log('this is cookieVal');
            console.log(cookieVal);
            console.log('this is response');
            console.log(res);
            console.log('this is request');
            console.log(req);

            res.append('Set-Cookie', 'connect.sid=s%3AHMQx1qIL1HooJJPwAyo503EPO2nCFXvP.ErBICpidxJnIGvJniKx7jfyo9Bxgt1nuggU%2BCHsijYk; Path=/; Expires=Sat, 07 Aug 2021 09:27:03 GMT; HttpOnly; SameSite=None; Path=/; HttpOnly; Secure;')
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