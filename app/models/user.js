var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	status: {
		type: String,
		default: "down"
	},
	nickName: {
		type: String,
		required: true
	},
	avatar: {
		type: String,
		default: "/image/user.png"
	},
	email: {
		type: String,
		default: ""
	},
	friends: [String]
});

var userModel = mongoose.model('user', userSchema, 'user');
