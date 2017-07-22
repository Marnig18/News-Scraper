// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	link: {
		type: String,
		required: true
	},
	description: {
		type: String,
		
	}, 
		picture:{
			type: String,

	},

	saved:{
		type: Boolean,
		default: false
	},

	created_at:{
		type: Date,
		default: Date.now
  },

	note:[{
		type: Schema.Types.ObjectId,
		ref: "Note"
	}]
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;