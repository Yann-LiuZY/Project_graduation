var mongoose = require("mongoose");

var groupSchema = new mongoose.Schema({
	creater: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	member: [String]
});

var groupMedel = mongoose.model("group", groupSchema, "group");
