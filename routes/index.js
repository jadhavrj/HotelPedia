var express     = require("express"),
    router      = express.Router(),
    passport    = require("passport"),
    User        = require("../models/user");

router.get("/", function (req, res) {
    res.render("landing");
});

//Auth Routes
//register
router.get("/register", function(req, res) {
    res.render("register", {page: 'register'});
});

router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
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
    req.flash("success", "You are now logged out");
    res.redirect("/hotels");
});

module.exports = router;