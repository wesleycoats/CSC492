var mongo = require('mongodb');

var Users = [
	{
		username : "testUser1",
		salt : "abcdefg",
		hash : "hash1",
		email : "user1@example.com",
		firstName : "John",
		lastName : "Doe",
		birthday : new Date("Jan 1 1950")
	},
	{
		username : "testUser2",
		salt : "hijklmno",
		hash : "hash2",
		email : "user2@example.com",
		firstName : "Johnny",
		lastName : "Does",
		birthday : new Date("Jan 1 1960")
	},
	{
		username : "testUser3",
		salt : "pqrstuvwxyz",
		hash : "hash3",
		email : "user3@example.com",
		firstName : "Johnson",
		lastName : "Doeson",
		birthday : new Date("Jan 1 1970")
	}
]

var PasswordAuths = [
	{
		userID : new mongo.ObjectID(),
		authToken : "aaaaaaaaa"
	},
	{
		userID : new mongo.ObjectID(),
		authToken : "bbbbbbbbb"
	},
	{
		userID : new mongo.ObjectID(),
		authToken : "ccccccccc"
	}
]

var Cars = [
	{
		name : "Red Car"
	},
	{
		name : "Blue Car"
	},
	{
		name : "Green Car"
	}
]

var CarsHistory = [
	{
		batteryLife : 95,
		currentLocation : [35.769219, -78.675626],
		steeringAngle : 55.46,
		headingAngle : 13.24,
		speed : 15,
		goal : 0,
		carID : new mongo.ObjectID()
	},
	{
		batteryLife : 95,
		currentLocation : [35.769743, -78.675071],
		steeringAngle : 47.65,
		headingAngle : 98.54,
		speed : 13.567,
		goal : 1,
		carID : new mongo.ObjectID()
	},
	{
		batteryLife : 95,
		currentLocation : [35.770362, -78.675628],
		steeringAngle : 87.56,
		headingAngle : 98.45,
		speed : 19.346,
		goal : 2,
		carID : new mongo.ObjectID()
	}
]

var Edges = [
	{
		startingNode : new mongo.ObjectID(),
		endingNode : new mongo.ObjectID(),
		length : 12.34,
		waypoints : [
			{
				coordinates : [1,2],
				speed : 13,
				headingAngle : 54.67,
				steeringAngle : 93.26,
				timeStamp : new Date(),
				tick : 0,
				actuator : [[true,true,true,false,true,false,true,true][true,true,true,false,true,false,true,true],[true,true,true,false,true,false,true,true]],
				motorControlFlags : [true,true,true,false,true,false,true,true],
				motorThrottle : [true,true,true,false,true,false,true,true]
			},
			{
				coordinates : [2,3],
				speed : 14,
				headingAngle : 55.67,
				steeringAngle : 94.26,
				timeStamp : new Date(),
				tick : 1,
				actuator : [[true,true,true,false,true,false,true,true][true,true,true,false,true,false,true,true][true,true,true,false,true,false,true,true]],
				motorControlFlags : [true,true,true,false,true,false,true,true],
				motorThrottle : [true,true,true,false,true,false,true,true]
			},
			{
				coordinates : [3,4],
				speed : 15,
				headingAngle : 56.67,
				steeringAngle : 95.26,
				timeStamp : new Date(),
				tick : 2,
				actuator : [[true,true,true,false,true,false,true,true],[true,true,true,false,true,false,true,true],[true,true,true,false,true,false,true,true]],
				motorControlFlags : [true,true,true,false,true,false,true,true],
				motorThrottle : [true,true,true,false,true,false,true,true]
			}
		]
	},
	{
		startingNode : new mongo.ObjectID(),
		endingNode : new mongo.ObjectID(),
		length : 34.12,
		waypoints : [
			{
				coordinates : [11,22],
				speed : 10,
				headingAngle : 54.67,
				steeringAngle : 93.26,
				timeStamp : new Date(),
				tick : 0,
				actuator : [[true,true,true,false,true,false,true,true],[true,true,true,false,true,false,true,true],[true,true,true,false,true,false,true,true]],
				motorControlFlags : [true,true,true,false,true,false,true,true],
				motorThrottle : [true,true,true,false,true,false,true,true]
			},
			{
				coordinates : [22,33],
				speed : 11,
				headingAngle : 53.67,
				steeringAngle : 92.26,
				timeStamp : new Date(),
				tick : 1,
				actuator : [[true,true,true,false,true,false,true,true],[true,true,true,false,true,false,true,true],[true,true,true,false,true,false,true,true]],
				motorControlFlags : [true,true,true,false,true,false,true,true],
				motorThrottle : [true,true,true,false,true,false,true,true]
			},
			{
				coordinates : [33,44],
				speed : 12,
				headingAngle : 52.67,
				steeringAngle : 91.26,
				timeStamp : new Date(),
				tick : 2,
				actuator : [[true,true,true,false,true,false,true,true],[true,true,true,false,true,false,true,true],[true,true,true,false,true,false,true,true]],
				motorControlFlags : [true,true,true,false,true,false,true,true],
				motorThrottle : [true,true,true,false,true,false,true,true]
			}
		]
	},
	{
		startingNode : new mongo.ObjectID(),
		endingNode : new mongo.ObjectID(),
		length : 43.21,
		waypoints : [
			{
				coordinates : [111,222],
				speed : 20,
				headingAngle : 34.67,
				steeringAngle : 67.26,
				timeStamp : new Date(),
				tick : 0,
				actuator : [[true,true,true,false,true,false,true,true],[true,true,true,false,true,false,true,true],[true,true,true,false,true,false,true,true]],
				motorControlFlags : [true,true,true,false,true,false,true,true],
				motorThrottle : [true,true,true,false,true,false,true,true]
			},
			{
				coordinates : [222,333],
				speed : 19,
				headingAngle : 35.67,
				steeringAngle : 66.26,
				timeStamp : new Date(),
				tick : 1,
				actuator : [[true,true,true,false,true,false,true,true],[true,true,true,false,true,false,true,true],[true,true,true,false,true,false,true,true]],
				motorControlFlags : [true,true,true,false,true,false,true,true],
				motorThrottle : [true,true,true,false,true,false,true,true]
			},
			{
				coordinates : [333,444],
				speed : 18,
				headingAngle : 36.67,
				steeringAngle : 65.26,
				timeStamp : new Date(),
				tick : 2,
				actuator : [[true,true,true,false,true,false,true,true],[true,true,true,false,true,false,true,true],[true,true,true,false,true,false,true,true]],
				motorControlFlags : [true,true,true,false,true,false,true,true],
				motorThrottle : [true,true,true,false,true,false,true,true]
			}
		]
	}
]

var Nodes = [
	{
		location : [35.769219, -78.675626],
		name : "Point 1",
		type : 0,
	},
	{
		location : [35.769743, -78.675071],
		name : "Point 2",
		type : 1,
	},
	{
		location : [35.770362, -78.675628],
		name : "Point 3",
		type : 2,
	}
]

//currentTask 0 = Needs PathFinding
//currentTask 1 = In Process
//currentTask 2 = Finished
var Rides = [
	{
		passengerLocation : [1.2342,2.564],
		numberOfPassengers : 3,
		pathChosen : [new mongo.ObjectID(), new mongo.ObjectID()],
		requestTime : new Date(),
		carArrivalTime : new Date(),
		pickupTime : new Date(),
		dropOffTime : new Date(),
		distance : 18,
		vehicleID : new mongo.ObjectID(),
		userID : new mongo.ObjectID(),
		startingNode :  new mongo.ObjectID(),
		endingNode : new mongo.ObjectID(),
		currentTask : 0
	},
	{
		passengerLocation : [3.43546,4.4576],
		numberOfPassengers : 3,
		pathChosen : [new mongo.ObjectID(), new mongo.ObjectID()],
		requestTime : new Date(),
		carArrivalTime : new Date(),
		pickupTime : new Date(),
		dropOffTime : new Date(),
		distance : 100,
		vehicleID : new mongo.ObjectID(),
		userID : new mongo.ObjectID(),
		startingNode :  new mongo.ObjectID(),
		endingNode : new mongo.ObjectID(),
		currentTask : 1
	},
	{
		passengerLocation : [5.234654,6.7674],
		numberOfPassengers : 3,
		pathChosen : [new mongo.ObjectID(), new mongo.ObjectID()],
		requestTime : new Date(),
		carArrivalTime : new Date(),
		pickupTime : new Date(),
		dropOffTime : new Date(),
		distance : 10,
		vehicleID : new mongo.ObjectID(),
		userID : new mongo.ObjectID(),
		startingNode :  new mongo.ObjectID(),
		endingNode : new mongo.ObjectID(),
		currentTask : 2
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

insertDocument("Users", Users, function(users){
	PasswordAuths[0].userID = users.ops[0]["_id"];
	PasswordAuths[1].userID = users.ops[1]["_id"];
	PasswordAuths[2].userID = users.ops[2]["_id"];
	if(!users)process.exit();
	console.log("Users Inserted");
	insertDocument("AuthTokens", PasswordAuths, function(passwordAuths){
	if(!passwordAuths)process.exit();
		console.log("Auth Table Inserted");
		insertDocument("Cars", Cars, function(cars) {
			if(!cars)process.exit();
			console.log("Cars Inserted");
			CarsHistory[0].carID = cars.ops[0]["_id"];
			CarsHistory[1].carID = cars.ops[1]["_id"];
			CarsHistory[2].carID = cars.ops[2]["_id"];
			insertDocument("carsHistory", CarsHistory, function(carsHistory){
				if(!carsHistory)process.exit();
				console.log("Cars History Inserted");
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
						Rides[0].pathChosen = [edges.ops[0]["_id"], edges.ops[1]["_id"]]
						Rides[1].pathChosen = [edges.ops[1]["_id"]]
						Rides[2].pathChosen = [edges.ops[1]["_id"], edges.ops[2]["_id"]]
						
						Rides[0].vehicleID = cars.ops[0]["_id"];
						Rides[1].vehicleID = cars.ops[1]["_id"];
						Rides[2].vehicleID = cars.ops[2]["_id"];
						
						Rides[0].userID = users.ops[0]["_id"];
						Rides[1].userID = users.ops[1]["_id"];
						Rides[2].userID = users.ops[2]["_id"];
						
						Rides[0].startingNode = nodes.ops[0]["_id"];
						Rides[1].startingNode = nodes.ops[1]["_id"];
						Rides[2].startingNode = nodes.ops[1]["_id"];
					
						Rides[0].endingNode = nodes.ops[1]["_id"];
						Rides[1].endingNode = nodes.ops[1]["_id"];
						Rides[2].endingNode = nodes.ops[2]["_id"];
						insertDocument("Rides", Rides, function(rides){
							if(!rides)process.exit();
							console.log("Rides Inserted");
							console.log("Test Data Loaded Successfully!");
						})
					})
				})
			})
		})
	})
})
