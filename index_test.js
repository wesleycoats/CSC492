var express = require('express');
var app = express();

app.use(express.static('public/templates'));

var mongo = require('mongodb');

app.get('/getStations', function (req, res) {
	findDocuments("Nodes", {}, function(stations){
		res.send(stations);
	})
})

app.get('/getCars', function (req, res) {
	findDocuments("Cars", {}, function(stations){
		res.send(stations);
	})
})

app.get('/getPaths', function (req, res) {
	findDocuments("Edges", {}, function(stations){
		res.send(stations);
	})
})

app.get('/getRides', function (req, res) {
	findDocuments("Rides", {}, function(stations){
		res.send(stations);
	})
})

var http = require('http').createServer(app);
http.listen(3000, function(){
	console.log("listening on port 3000");
})

var url = 'mongodb://localhost:27017/ecoprt';
var MongoClient = require('mongodb').MongoClient;

var connectToDB = function(callback) {
	MongoClient.connect(url, function(err, db) {
	  if(err) {
	  	console.log(err);
	  	callback(false);
	  }
	  else callback(db);
	});
}

var findDocuments = function(collectionToUse, fieldToFind, callback) {
	connectToDB(function(db){
		var collection = db.db("ecoprt").collection(collectionToUse);
		collection.find(fieldToFind).toArray(function(err, result) {
			db.close();
			if(err) {
				console.log(err);
				callback(false);
			} else {
				callback(result);
			}
		})
	})
}