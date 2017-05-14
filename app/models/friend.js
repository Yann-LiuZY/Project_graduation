var mongoose = require("mongoose");

var friendSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	friends: [String]
});

var friendModel = mongoose.model('friend', userSchema, 'friend');
