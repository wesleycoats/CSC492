var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var xFrameOptions = require('x-frame-options');
app.use(xFrameOptions());
 
// create application/json parser 
app.use(bodyParser.json());
 
// create application/x-www-form-urlencoded parser 
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public_temp'));

var mongo = require('mongodb');

app.post('/addNode', function (req, res) {
	var form = req.body;
	var newStation = {
		name : form.name,
		location : [form.location[0], form.location[1]],
		type : +form.type
	}
	findDocuments("Nodes", {name:newStation.name}, function(stationsWithSameName){
		if(stationsWithSameName.length==0) {
			insertDocument("Nodes", newStation, function(ns) {
				if(ns) {
					resSuccess(res, "Station Added");
				} else {
					resError(res, "An Error Occured", 500);
				}
			})
		} else {
			resError(res, "Station With Same Name Already Exists", 400);
		}
	})
})

app.post('/addVehicle', function (req, res) {
	var form = req.body;
	var newCar = {
		name : form.name,
	}
	findDocuments("Cars", {name:newCar.name}, function(carsWithSameName){
		if(carsWithSameName.length==0) {
			insertDocument("Cars", newCar, function(nv) {
				if(nv) {
					resSuccess(res, "Car Added");
				} else {
					resError(res, "An Error Occured", 500);
				}
			})
		} else {
			resError(res, "Car With Same Name Already Exists", 400);
		}
	})
})

app.post('/addEdge', function (req, res) {
	var form = req.body;
	var newEdge = {
		startingNode : form.startingNode,
		endingNode : form.endingNode,
		distance : form.distance,
		waypoints : []
	}
	for(var i=0;i<form.waypoints.length;i++) {
		newEdge.waypoints[i] = {
			coordinates : [form.waypoints[i].coordinates[0], form.waypoints[i].coordinates[1]],
			speed : form.waypoints[i].speed,
			headingAngle : form.waypoints[i].headingAngle,
			steeringAngle : form.waypoints[i].steeringAngle,
			timeStamp : form.waypoints[i].timeStamp,
			tick : form.waypoints[i].tick,
			actuator : form.waypoints[i].actuator,
			motorControlFlags : [form.waypoints[i].motorControlFlags[0], form.waypoints[i].motorControlFlags[1], form.waypoints[i].motorControlFlags[2], form.waypoints[i].motorControlFlags[3], form.waypoints[i].motorControlFlags[4], form.waypoints[i].motorControlFlags[5], form.waypoints[i].motorControlFlags[6], form.waypoints[i].motorControlFlags[7]],
			motorThrottle : form.waypoints[i].motorThrottle
		}
	}
	insertDocument("Edges", newEdge, function(ne) {
		if(ne) {
			resSuccess(res, "Edge Added");
		} else {
			resError(res, "An Error Occured", 500);
		}
	})
})

app.post('/addRide', function (req, res) {
	var form = req.body;
	var newRide = {
		numberOfPassengers : form.numberOfPassengers,
		pathChosen: form.pathChosen,
		passengerLocation : form.passengerLocation,
		distance : form.distance,
		vehicleID : form.vehicleID,
		userID : form.userID,
		startingNode : form.startingNode,
		endingNode : form.endingNode,
		currentTask : form.currentTask,
	}
	insertDocument("Rides", newRide, function(nr){
		if(nr) {
			resSuccess(res, "Ride Added");
		} else {
			resError(res, "An Error Occured", 500);
		}
	})
})

app.get('/getNodes', function (req, res) {
	findDocuments("Nodes", {}, function(stations){
		res.send(stations);
	})
})

app.get('/getVehicles', function (req, res) {
	findDocuments("Cars", {}, function(stations){
		res.send(stations);
	})
})

app.get('/getEdges', function (req, res) {
	findDocuments("Edges", {}, function(stations){
		res.send(stations);
	})
})

app.get('/getRides', function (req, res) {
	findDocuments("Rides", {}, function(stations){
		res.send(stations);
	})
})

function resError(res, message, code) {
	if(code) {
		res.status(code);
	} else {
		res.status(500);
	}
	res.send(message);
}

function resSuccess(res, message) {
	res.status(200);
	res.send(message);
}

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

var insertDocument = function(collectionToUse, docToInsert, callback) {
	connectToDB(function(db){
		var collection = db.db("ecoprt").collection(collectionToUse);
		collection.insert(docToInsert, function(err, result) {
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

var updateDocument = function(collectionToUse, docToUpdate, fieldToUpdate, callback) {
	connectToDB(function(db){
		var collection = db.db("ecoprt").collection(collectionToUse);
		collection.updateOne(docToUpdate, {$set:fieldToUpdate}, function(err, result) {
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

var updateDocumentNoSet = function(collectionToUse, docToUpdate, fieldToUpdate, callback) {
	connectToDB(function(db){
		var collection = db.db("ecoprt").collection(collectionToUse);
		collection.updateOne(docToUpdate, fieldToUpdate, function(err, result) {
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

var deleteDocument = function(collectionToUse, fieldToDeleteDoc, callback) {
	connectToDB(function(db){
		var collection = db.db("ecoprt").collection(collectionToUse);
		collection.deleteOne(fieldToDeleteDoc, function(err, result) {
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

var deleteDocuments = function(collectionToUse, fieldToDeleteDoc, callback) {
	connectToDB(function(db){
		var collection = db.db("ecoprt").collection(collectionToUse);
		collection.deleteMany(fieldToDeleteDoc, function(err, result) {
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

var findDocumentsCount = function(collectionToUse, fieldToFind, callback) {
	connectToDB(function(db){
		var collection = db.db("ecoprt").collection(collectionToUse);
		collection.count(fieldToFind, function(err, result) {
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

var findDocumentsWithFields = function(collectionToUse, fieldToFind, fieldsToReturn, sort, limit, callback) {
	connectToDB(function(db){
		var collection = db.db("ecoprt").collection(collectionToUse);
		collection.find(fieldToFind).project(fieldsToReturn).sort(sort).limit(limit).toArray(function(err, result) {
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

var aggregateDocuments = function(collectionToUse, aggregate, callback) {
	connectToDB(function(db){
		var collection = db.db("ecoprt").collection(collectionToUse);
		collection.aggregate(aggregate).toArray(function(err, result) {
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