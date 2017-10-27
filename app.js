var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    methodOverride  = require("method-override"), 
    flash           = require("connect-flash"),
    Hotel           = require("./models/hotel"),
    Comment         = require("./models/comment"),
    User            = require("./models/user"),
    seedDB          = require("./seed");
    
var indexRoutes     = require("./routes/index"),
    hotelRoutes     = require("./routes/hotels"),
    commentRoutes   = require("./routes/comments");
    
var url = process.env.DATABASEURL || "mongodb://localhost/hotel_pedia_v13";
mongoose.connect(url, {useMongoClient: true});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');
//seedDB(); //seedDB

//Passport Configuration
app.use(require("express-session")({
    secret: "I am the best!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");  
    next();
});

app.use("/", indexRoutes);
app.use("/hotels", hotelRoutes);
app.use("/hotels/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function () {
    console.log("Hotelpedia Server Started!!");
});