// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
var handlebars = require("handlebars")
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var methodOverride = require("method-override");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));
	app.engine("handlebars", exphbs({defaultLayout: "main"}));
	app.set("view engine", "handlebars");	

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/mongoScrapper");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});


//ROUTES
//=========
////Loading Index page
app.get("/", function(req,res){
	res.render("index")
})



//Get request to scrape Refinery29
app.get("/scrape", function(req, res){

	//grabbing body of the HTML
	request("http://www.huffingtonpost.com/", function(error, response, html){
	// request("http://www.refinery29.com/", function(error, response, html){
		//loading the body of the html into cheerio and saving as $
		var $ = cheerio.load(html);
		//grabbing very div with class card and 
		$("div.card--twilight").each(function(i, element){
			//save result as a results object
			 var result = {};
			// //getting title, desription, picture and link for every result object 
			// result.link = $(this).find("a").attr("href");
			// result.picture = $(this).find("a").children("div").find("div.opener-image").children("img").attr("src");
			// result.title = $(this).find("a").find("div.story-content").find("div.title span").text();
			// result.description = $(this).find("a").find("div.abstract").find("div.title").text();
			result.title =$(this).find("div.card__details").children("div.card__headlines").find("h2").find("a").text();
			result.link =$(this).find("div.card__details").children("div.card__headlines").find("a").attr("href")
			result.picture= $(this).children("div.card__content").find("a").find("div.card__image__wrapper").find("img").attr('src')
			result.description= $(this).find("div.card__details").children("div.card__headlines").find("div.card__description").find("a").text();
			
			var entry = new Article(result);

			entry.save(function(err,doc){
				if (err) {
		          console.log(err);
		        }
		        // Or log the doc
		        else {
		          console.log(doc);
		        }
			})
		})
	})
	Article.find({"saved": false}).limit(20).sort({"created_at" : -1}).exec(function(err, doc){
		  if (err) {
      console.log(err);
    }
    // Otherwise, save the result as an handlebars object
    else {
      
      var hbsObject = {
      		articles: doc

      }
      console.log(doc)
      res.render("index", hbsObject)
    }
	})
})




	app.get("/saved", function(req, res){
		Article.find({"saved": true}).populate("note").
		exec(function(error, doc){
			   if (error) {
	      console.log(error);
	    }
	    else{
	    	 var hbsObject = {
	      		articles: doc

	      }
	     res.render("saved", hbsObject) 
	    }
		})
	})

//When save button is clicked 
app.post("/:id",function(req,res){
	
	// var id = new mongoose.Types.ObjectId(req.params.id);

	Article.findOneAndUpdate({
		"_id": req.params.id
	},{
		$set: {"saved": true}, 

	},{ new: true }).exec(function(err, doc){
		  if (err) {
      res.send(err);
     }
     else{

      var hbsObject = {
      		articles: doc

      }
      console.log("worked")
     	res.redirect("/scrape")
     	
     	console.log(doc)

     }
	})

})



app.get("/:id", function(req, res) {
console.log(req.params.id)
 
  Article.findOne({
    "_id": req.params.id
  }).populate("note").exec(function(error, doc){
      if (error) {
        res.send(error);
      }
      // Or send the doc to the browser
      else {
      	  var hbsObject = {
      			notes: doc
      	}
      	console.log('worked')
        console.log(doc);
       
      }
  	})

 });


///Create new Note
app.post("/saved/:id", function(req, res){

	var newNote = new Note(req.body);
	console.log(req.body)

	newNote.save(function(error, doc){
		 if (error) {
      res.send(error);
    }
    	else{
    		Article.findOneAndUpdate({"_id": req.params.id},
    		 {$push: {"note": doc._id} }, {new: true})
    		.exec(function(err, newdoc){
    			  if (err) {
          	res.send(err);
          }
          else{
          	console.log(newdoc)
          	res.redirect("/saved")
          }
    		})
    	}
	})	
})


app.post("/delete/:id", function(req, res){

	Article.remove({"_id": req.params.id})
	.exec(function(err,doc){
			if (err) {
          	res.send(err);
          }
        else{
        	console.log(doc)
        	return res.redirect("/saved")
        	}
        
	})

})

app.post("/deleteNote/:id", function(req, res){

	Note.remove({"_id": req.params.id})
	.exec(function(err,doc){
			if (err) {
          	res.send(err);
          }
        else{
        	console.log(doc)
        	return res.redirect("/saved")
        	}
        
	})

})




app.listen(4000, function() {
  console.log("App running on port 4000!");
});
