var express     = require("express"),
    router      = express.Router(),
    passport    = require("passport"),
    User        = require("../models/user"),
    Hotel       = require("../models/hotel"),   
    middleware  = require("../middleware");

router.get("/", function (req, res) {
    res.render("landing");
});

//Auth Routes
//register
router.get("/register", function(req, res) {
    res.render("register", {page: 'register'});
});

router.post("/register", function(req, res) {
    var newUser = new User(
        {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            avatar: req.body.avatar
        });
    if(req.body.adminCode === "secretcode") {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, User){
        if(err) {
            req.flash("error", err.message);
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
                res.redirect("/hotels");    
            });
        }
    });
});

//login 
router.get("/login", function(req, res) {
    res.render("login", {page: 'login'});
});

router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/hotels",
        failureRedirect: "/login"
    }), function(req, res) {
});

//logout
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "See you later!");
    res.redirect("/hotels");
});

//user profile
//show
router.get("/users/:id", function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if(err){
            req.flash("error", "User not found");
            console.log(err);
            res.redirect("back");
        } else {
            Hotel.find().where("author.id").equals(user._id).exec(function (err, hotels) {
                if(err){
                    req.flash("error", "Sorry. Something went wrong");
                    console.log(err);
                    res.redirect("back");
                } else{
                    res.render("users/show", {user: user , hotels: hotels});
                }
            });
        }
    });
});

//edit
router.get("/users/:id/edit", middleware.checkUserOwnership, function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if(err){
            req.flash("error", "User not found");
            console.log(err);
            res.redirect("back");
        } else {
            res.render("users/edit", {user: user});
        }
    });
});

//update
router.post("/users/:id", middleware.checkUserOwnership, function(req, res) {
    var data = 
        {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            avatar: req.body.avatar
        };
    if(req.body.adminCode === "secretcode") {
        data.isAdmin = true;
    }
    User.findByIdAndUpdate(req.params.id, data, function(err, updatedUser){
        if(err) {
            req.flash("error", "Sorry. Something went wrong");
            console.log(err);
            res.redirect("back");
        } else {
                req.flash("success", "Profile updated");
                res.redirect("/users/" + req.params.id);    
        }
    });
});

module.exports = router;