require('dotenv').config();

const express = require("express");
const cookieParser = require('cookie-parser');
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");

//something

const passport = require("./passport/setup");
const auth = require("./routes/auth");
const content = require("./routes/content")
var config = JSON.parse(process.env.APP_CONFIG);
const mongoPassword = process.env.MONGODBPASS;
const PORT = process.env.PORT;

const app = express();
const MONGO_URI = "mongodb://" + config.mongo.user + ":" + encodeURIComponent(mongoPassword) + "@" +
    config.mongo.hostString + "/tutorial_social_login";

const local = process.env.ARI_LOCALHOST;
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
        cookie: { secure: true, sameSite="none", httpOnly=true, path="/", maxAge=99999999 },
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
        },
        secret: "very secret this is",
        resave: false,
        saveUninitialized: true,
        store: new MongoStore({ mongooseConnection: mongoose.connection })
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Add headers
app.use(function (req, res, next) {
    const allowedOrigins = ['http://localhost:4200', 'https://ari-edu.firebaseapp.com', 'https://ari-edu.web.app'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Routes
app.use("/api/auth", auth);
app.use("/api/content", content);
app.get("/", (req, res) => res.send("Good morning sunshine!"));

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}!`));