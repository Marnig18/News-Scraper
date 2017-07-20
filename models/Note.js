// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

var NoteSchema = new Schema({

	title: {
	 type: String
	},

	body: {
		type: String
	}

});

var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;