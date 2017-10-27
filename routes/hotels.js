var express     = require("express"),
    router      = express.Router(),
    Hotel       = require("../models/hotel"),
    middleware  = require("../middleware"),
    geocoder        = require('geocoder');

//Hotel Routes
//Index
router.get("/", function (req, res) {
    Hotel.find({}, function(err, allHotels) {
        if(err){
            req.flash("error", "We are facing some technical issues");
            console.log(err);
        } else {
            res.render("hotels/index", {hotels: allHotels, page: 'hotels'});
        }
    });
});

//New
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("hotels/new");
});

//Create
router.post("/", middleware.isLoggedIn, function(req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
      id: req.user._id,
      username: req.user.username
    }
    var price = req.body.price;
    geocoder.geocode(req.body.location, function (err, data) {
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newHotel = {name: name, image: image, description: desc, price: price, author: author, location: location, lat: lat, lng: lng};
        
        Hotel.create(newHotel, function(err, addedHotel) {
            if(err){
                req.flash("error", "We are facing some technical issues");
                console.log(err);
                res.redirect("/hotels");
            } else {
                console.log("New Hotel added to database");
                console.log(addedHotel);
                req.flash("success", "Hotel added");
                res.redirect("/hotels");     
            }
        });
    });
});

//Show
router.get("/:id", function(req, res) {
    Hotel.findById(req.params.id).populate("comments").exec(function(err, foundHotel) {
        if(err || !foundHotel) {
            req.flash("error", "Hotel not found");
            console.log(err);
            res.redirect("/hotels");
        } else {
             res.render("hotels/show", {hotel: foundHotel});
        }
    });
});

//Edit
router.get("/:id/edit", middleware.checkHotelOwnership, function(req, res) {
    Hotel.findById(req.params.id, function (err, foundHotel) {
        if(err || !foundHotel) {
            req.flash("error", "Hotel not found");
            console.log(err);
            res.redirect("/hotels/"+req.params.id);
        }
        else {
            res.render("hotels/edit", {hotel: foundHotel});
        }
    })
});

//Update
router.put("/:id", middleware.checkHotelOwnership, function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newData = {name: req.body.name, image: req.body.image, description: req.body.description, price: req.body.price, location: location, lat: lat, lng: lng};
        Hotel.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, updatedHotel){
            if(err || !updatedHotel) {
                req.flash("error", "We are facing some technical issues");
                console.log(err);
                res.redirect("/hotels/"+req.params.id);
            } else {
                req.flash("success", "Hotel updated");
                res.redirect("/hotels/"+req.params.id);
            }
        });
    });     
});

//Destroy
router.delete("/:id", middleware.checkHotelOwnership, function(req, res) {
    Hotel.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", "We are facing some technical issues");
            console.log(err);
            res.redirect("/hotels/"+req.params.id);
        } else{
            req.flash("success", "Hotel deleted");
            res.redirect("/hotels");
        }
    });
});

module.exports = router;