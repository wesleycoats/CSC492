var mongo = require('mongodb');

var Vehicle = {
	name : "Blue Car",
	enabled : true,
	batteryLife : 30,
	coordinates : [35.7686963207063, -78.6771035309432],
	steeringAngle : 1.243,
	headingAngle : 0.987,
	speed : 15,
	rideID : new mongo.ObjectID(),
	edgeID : new mongo.ObjectID(),
	vehicleID : new mongo.ObjectID(),
	rideQueue : []
}

var vehicleHistory = {
	batteryLife : 30,
	coordinates : [35.7686963207063, -78.6771035309432],
	steeringAngle : 1.243,
	headingAngle : 0.987,
	speed : 15,
	rideID : new mongo.ObjectID(),
	edgeID : new mongo.ObjectID(),
	vehicleID : new mongo.ObjectID(),
	rideQueue : []
}

var Edges = [
	{
		startingNode : new mongo.ObjectID(),
		endingNode : new mongo.ObjectID(),
		distance : 12.34,
		waypoints : [
			{
				coordinates : [35.769219,-78.675626],
				speed : 13,
				headingAngle : 54.67,
				steeringAngle : 93.26,
				timeStamp : new Date(),
				tick : 0,
				actuator : [0,1,2],
				motorControlFlags : [true,true,true,false,true,false,true,true],
				motorThrottle : 1
			},
			{
				coordinates : [35.769743,-78.675071],
				speed : 15,
				headingAngle : 56.67,
				steeringAngle : 95.26,
				timeStamp : new Date(),
				tick : 2,
				actuator : [2,3,4],
				motorControlFlags : [true,true,true,false,true,false,true,true],
				motorThrottle : 3
			}
		]
	},
	{
		startingNode : new mongo.ObjectID(),
		endingNode : new mongo.ObjectID(),
		distance : 34.12,
		waypoints : [
			{
				coordinates : [35.769743,-78.675071],
				speed : 10,
				headingAngle : 54.67,
				steeringAngle : 93.26,
				timeStamp : new Date(),
				tick : 0,
				actuator : [3,4,5],
				motorControlFlags : [true,true,true,false,true,false,true,true],
				motorThrottle : 4
			},
			{
				coordinates : [35.770362,-78.675628],
				speed : 12,
				headingAngle : 52.67,
				steeringAngle : 91.26,
				timeStamp : new Date(),
				tick : 2,
				actuator : [6,7,8],
				motorControlFlags : [true,true,true,false,true,false,true,true],
				motorThrottle : 6
			}
		]
	},
	{
		startingNode : new mongo.ObjectID(),
		endingNode : new mongo.ObjectID(),
		distance : 43.21,
		waypoints : [
			{
				coordinates : [35.770362,-78.675628],
				speed : 20,
				headingAngle : 34.67,
				steeringAngle : 67.26,
				timeStamp : new Date(),
				tick : 0,
				actuator : [7,8,9],
				motorControlFlags : [true,true,true,false,true,false,true,true],
				motorThrottle : 7
			},
			{
				coordinates : [35.769219,-78.675626],
				speed : 18,
				headingAngle : 36.67,
				steeringAngle : 65.26,
				timeStamp : new Date(),
				tick : 2,
				actuator : [9,0,1],
				motorControlFlags : [true,true,true,false,true,false,true,true],
				motorThrottle : 9
			}
		]
	}
]

var Nodes = [
	{
		coordinates : [35.769219, -78.675626],
		name : "Point 1",
		type : 0,
	},
	{
		coordinates : [35.769743, -78.675071],
		name : "Point 2",
		type : 1,
	},
	{
		coordinates : [35.770362, -78.675628],
		name : "Point 3",
		type : 2,
	}
]

  ///////////////////
 //Mongo////////////
///////////////////

var url = 'mongodb://localhost:27017/ecoprt';
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
  
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

insertDocument("Vehicles", Vehicle, function(vehicle) {
	if(!vehicle)process.exit();
	console.log("Vehicle Inserted");
	vehicleHistory.carID = vehicle.ops[0]["_id"];
	insertDocument("vehiclesHistory", vehicleHistory, function(vehiclesHistory){
		if(!vehiclesHistory)process.exit();
		console.log("Vehicle History Inserted");
		insertDocument("Nodes", Nodes, function(nodes) {
			if(!nodes)process.exit();
			console.log("Nodes Inserted");
			Edges[0].startingNode = nodes.ops[0]["_id"];
			Edges[1].startingNode = nodes.ops[1]["_id"];
			Edges[2].startingNode = nodes.ops[2]["_id"];
			
			Edges[0].endingNode = nodes.ops[1]["_id"];
			Edges[1].endingNode = nodes.ops[2]["_id"];
			Edges[2].endingNode = nodes.ops[0]["_id"];
			insertDocument("Edges", Edges, function(edges){
				if(!edges)process.exit();
				console.log("Edges Inserted");
				console.log("Test Data Loaded Successfully!");
			})
		})
	})
})
