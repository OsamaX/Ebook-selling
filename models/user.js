const mongoose = require("mongoose"), bcrypt = require("bcrypt");

let userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    favoriteBook: {
        type: String,
        required: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    profile_img: String,

    details: Object
});

userSchema.statics.authenticate = function(email, password, callback) {
    User.findOne({email: email}, function(error, user) {
        if (error) {
            console.log("in error");
            return callback(error);
        
        } else if( !user ) {
            let err = "User not found";
            console.log("User not found");
            return callback(err);
        }

        bcrypt.compare(password, user.password, function(err, result) {
            if (result) {
                console.log(result);
                return callback(null,user);
            } else {
                return callback();
            }
        }) 

    })

}

userSchema.pre("save", function(next) {
    let user = this;
    bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) {
            next(err)
        } else {
            user.password = hash;
            next();
        }
    })
});

let User = mongoose.model("User", userSchema);
module.exports = User;