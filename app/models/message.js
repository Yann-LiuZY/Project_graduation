var mongoose = require("mongoose");

var messageSchema = new mongoose.Schema({
	speakerName: {
		type: String,
		required: true
	},
	speakerNickName: {
		type: String,
		required: true
	},
	speakerAvatar: {
		type: String,
		required: true
	},
	listenerName: {
		type: String,
		required: true
	},
	listenerNickName: {
		type: String,
		required: true
	},
	listenerAvatar: {
		type: String,
		required: true
	},
	message: {
		type: String,
		required: true
	},
	createDate: {
		type: Date,
		default: new Date()
	}
});

var messageModel = mongoose.model('message', messageSchema, 'message');
