const express = require("express");
const router = express.Router();
const Content = require("../models/content");

router.post('/content', (req, res, next) => {
    console.log('entered endpoint post to /content...');
    if (req.isAuthenticated()) {
        let recievedContent = req.body;
        console.log("content recieved: ", recievedContent);
        Content.create(recievedContent)
            .then(() => {
                return res.status(201).json({ success: `Content successfully saved!` });
            })
            .catch(err => {
                console.log("Caught error when attempting to save content", err);
                return res.status(400).json({ "statusCode": 400, "message": "Cannot save content because of an error" });
            });;
    } else {
        return res.status(401).json({ "statusCode": 401, "message": "Not authenticated" });
    }
});

module.exports = router;