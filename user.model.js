  
const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');

// User Schema
const userSchema = mongoose.Schema({
	email : {
		type: String,
		require : true,
		unique : true
	},
	name : {
        type: String,
        require : true,
        min : 2,
        max : 28
    },
    phoneNo : {
        type: String,
        require : false,
        unique : true, 
        min: 10,
        max: 14
    },
    password : {
        type: String,
        require : true
    },
    age: {
        type: Number,
        require : true,
        min : 1,
        max : 120
    },
    gender: {
        type: Boolean,              // male : true          female : false
        require :true
    }
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('user',userSchema);
