var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    Hotel       = require("../models/hotel"),
    Comment     = require("../models/comment"),
    middleware  = require("../middleware");
    
//Comments Routes
//new
router.get("/new", middleware.isLoggedIn, function(req, res) {
    Hotel.findById(req.params.id, function (err, hotel) {
        if(err) {
            req.flash("error", "We are facing some technical issues");
            console.log(err);
        } else {
            res.render("comments/new", {hotel: hotel});
        }
    })
});

//create
router.post("/", middleware.isLoggedIn, function (req, res) {
    Hotel.findById(req.params.id, function(err, hotel) {
            if(err) {
                req.flash("error", "We are facing some technical issues");
                console.log(err);
                res.redirect("/hotels");
            } else {
                 Comment.create(req.body.comment, function (err, comment) {
                    if(err) {
                        req.flash("error", "We are facing some technical issues");
                        console.log(err);
                    } else {
                        comment.author.id = req.user._id;
                        comment.author.username = req.user.username;
                        comment.save();
                        hotel.comments.push(comment);
                        hotel.save();
                        req.flash("success", "Comment added");
                        res.redirect("/hotels/" + hotel._id);
                    }
                })
            }
        }
    );
});

//edit
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, comment) {
        if(err || !comment){
            req.flash("error", "Comment not found");
            console.log(err);
            res.redirect("back");
        } else{
            res.render("comments/edit", {hotel_id: req.params.id, comment: comment});
        }
    });
});

//update
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if(err || !updatedComment){
            req.flash("error", "We are facing some technical issues");
            console.log(err);
            res.redirect("back");
        } else{
            req.flash("success", "Comment updated");
            res.redirect("/hotels/" + req.params.id);
        }
    })
});
//destroy
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if(err) {
            req.flash("error", "We are facing some technical issues");
            console.log(err);
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/hotels/" + req.params.id);
        }
    });
});
    
module.exports = router;