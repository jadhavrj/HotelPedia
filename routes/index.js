var express     = require("express"),
    router      = express.Router(),
    passport    = require("passport"),
    User        = require("../models/user"),
    Hotel       = require("../models/hotel"),   
    middleware  = require("../middleware"),
    async       = require("async"),
    nodemailer  = require("nodemailer"),
    crypto      = require("crypto");

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

// forgot password
router.get('/forgot', function(req, res) {
  res.render('users/forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (err || !user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'hotelpedia2017@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'hotelpedia2017@gmail.com',
        subject: 'HotelPedia2017 Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (err || !user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('users/reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (err || !user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
              if(err) {
                  req.flash("error", "Sorry. Something went wrong");
                  console.log(err);
                  res.redirect("back");
              }
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
                if(err) {
                  req.flash("error", "Sorry. Something went wrong");
                  console.log(err);
                  res.redirect("back");
              }
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'hotelpedia2017@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'hotelpedia2017@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
        if(err) {
            req.flash("error", "Sorry. Something went wrong");
            console.log(err);
            res.redirect("back");
        }
    res.redirect('/hotels');
  });
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