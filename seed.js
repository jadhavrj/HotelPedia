var mongoose    = require("mongoose"),
    Hotel       = require("./models/hotel"),
    Comment     = require("./models/comment");

//seed data    
var data = [
    {
        name : "Palladium",
        image: "https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?h=350&auto=compress&cs=tinysrgb",
        description:"Experience the finest hotel in realm. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc odio ligula, ullamcorper at cursus quis, mattis sit amet dolor. Quisque quis augue nec orci laoreet bibendum sit amet eu sem. Curabitur in vulputate lacus, sit amet tincidunt sem. Ut finibus ultricies odio, ac bibendum quam lacinia eget. Maecenas venenatis rutrum ipsum id congue. Proin ornare risus at interdum sollicitudin. Duis vel erat et ligula posuere blandit et vitae augue. Mauris id urna in massa pulvinar faucibus. Vivamus scelerisque vel nisi at fermentum. Quisque eget sapien et velit commodo molestie."
    },
    {
        name : "Ceaser",
        image: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?h=350&auto=compress&cs=tinysrgb",
        description:"Away from the world. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc odio ligula, ullamcorper at cursus quis, mattis sit amet dolor. Quisque quis augue nec orci laoreet bibendum sit amet eu sem. Curabitur in vulputate lacus, sit amet tincidunt sem. Ut finibus ultricies odio, ac bibendum quam lacinia eget. Maecenas venenatis rutrum ipsum id congue. Proin ornare risus at interdum sollicitudin. Duis vel erat et ligula posuere blandit et vitae augue. Mauris id urna in massa pulvinar faucibus. Vivamus scelerisque vel nisi at fermentum. Quisque eget sapien et velit commodo molestie."
    },
    {
        name : "Taj",
        image: "https://images.pexels.com/photos/261137/pexels-photo-261137.jpeg?h=350&auto=compress&cs=tinysrgb",
        description:"live life king size. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc odio ligula, ullamcorper at cursus quis, mattis sit amet dolor. Quisque quis augue nec orci laoreet bibendum sit amet eu sem. Curabitur in vulputate lacus, sit amet tincidunt sem. Ut finibus ultricies odio, ac bibendum quam lacinia eget. Maecenas venenatis rutrum ipsum id congue. Proin ornare risus at interdum sollicitudin. Duis vel erat et ligula posuere blandit et vitae augue. Mauris id urna in massa pulvinar faucibus. Vivamus scelerisque vel nisi at fermentum. Quisque eget sapien et velit commodo molestie."
    }
];

//seed function
function seedDB() {
    //remove hotels
    Hotel.remove({}, function(err) {
        if(err) {
            console.log(err);
        } else {
            //remove comments
             Comment.remove({});
            //create new hotels
            data.forEach(function (seed) {
                Hotel.create(seed, function(err, hotel) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log(hotel);
                        Comment.create(
                            {
                                text: "This hotel is absolutely Amazing!!!",
                                author: "Trump"
                            }, function (err, comment) {
                                if(err) {
                                    console.log(err);
                                }
                                else {
                                    hotel.comments.push(comment);
                                    hotel.save();
                                    console.log("Comment Added");
                                }
                            }
                        );
                    }
                });
            });
        }
    });   
}

module.exports = seedDB;