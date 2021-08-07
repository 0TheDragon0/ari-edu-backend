require('dotenv').config();

const express = require("express");
const cookieParser = require('cookie-parser');
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");

const fs = require("fs");
const https = require("https");

const passport = require("./passport/setup");
const auth = require("./routes/auth");
const content = require("./routes/content")
var config = JSON.parse(process.env.APP_CONFIG);
const mongoPassword = process.env.MONGODBPASS;
const PORT = process.env.PORT;

const local = process.env.ARI_LOCALHOST;
let key = null;
let cert = null;
if (local == "yes") {
    key = fs.readFileSync("cert.key", "utf-8");
    cert = fs.readFileSync("cert.crt", "utf-8");
}

const app = express();

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        next();
    }
});

const MONGO_URI = "mongodb://" + config.mongo.user + ":" + encodeURIComponent(mongoPassword) + "@" +
    config.mongo.hostString + "/tutorial_social_login";

if (local == "yes") {
    mongoose
        .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(console.log(`MongoDB connected ${MONGO_URI}`))
        .catch(err => console.log(err));
} else {
    mongoose
        .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, tls: true, tlsCAFile: 'evennode.pem', tlsAllowInvalidHostnames: true })
        .then(console.log(`MongoDB connected ${MONGO_URI}`))
        .catch(err => console.log(err));
}

// Bodyparser middleware, extended false does not allow nested payloads
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Express Session
app.use(
    session({
        cookie: {
            secure: true,
            maxAge: 1000 * 60 * 60 * 24 * 7,
            sameSite: 'none',
            httpOnly: true
        },
        secret: "very secret this is",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({ mongooseConnection: mongoose.connection })
    })
);

// Passport middleware
app.use(passport.initialize());
//app.use(passport.session());
app.use(passport.authenticate('session'));


// Add headers
/*  app.use(function (req, res, next) {
    const allowedOrigins = ['https://localhost:4200', 'https://ari-edu.firebaseapp.com', 'https://ari-edu.web.app'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', ['X-Requested-With', 'content-type']);
    res.setHeader('Access-Control-Request-Headers', ['X-Requested-With', 'content-type']);

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
*/

// Routes
app.use("/api/auth", auth);
app.use("/api/content", content);
app.get("/", (req, res) => res.send("Good morning sunshine!"));

if (local == "yes") {
    https.createServer({ key, cert }, app).listen(PORT);
} else {
    app.listen(PORT, () => console.log(`Backend listening on port ${PORT}!`));
}