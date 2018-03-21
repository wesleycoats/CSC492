var runSimulation = false;
var carsRunninginSimulation = 3;
var distToTravelPerFrame = 1;
var portToUse = 80;

var express = require('express');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var geolib = require('geolib');
var app = express();

var mongo = require('mongodb');

var xFrameOptions = require('x-frame-options');
app.use(xFrameOptions());
 
// create application/json parser 
app.use(bodyParser.json());
 
// create application/x-www-form-urlencoded parser 
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

app.get('/', function (req, res) {
	res.sendFile('public/index.html')
})

app.get('/userInfo', function (req, res) {
	if(req.get("authToken")) {
		findDocuments("AuthTokens", {authToken:req.get("authToken")}, function(matchingAuthTokens){
			if(matchingAuthTokens[0]) {
				findDocumentsWithFields("Users", {_id:matchingAuthTokens[0]["userID"]}, {_id:0, username:1, userType:1}, {}, 1, function(user){
					if(user[0]) {
						resSuccess(res, user[0]);
					} else {
						resError(res, "An Error Has Occured", 400);
					}
				})
			} else {
				resError(res, "Must be signed in", 400);
			}
		})
	} else {
		resError(res, "Must be signed in", 400);
	}
})

app.post('/signIn', function (req, res) {
	var form = req.body;
	if(form && form.email && form.password) {
		findDocuments("Users", {lowercaseEmail:form.email.toLowerCase()}, function(user){
			if(user[0]) {
				var passwordToCheck = sha512(form.password, user[0].salt);
				if(passwordToCheck == user[0].hash) {
					var authToken = randomString(30);
					insertDocument("AuthTokens", {userID:user[0]["_id"], authToken: authToken}, function(result){
						if(result) {
							resSuccess(res, authToken);
						} else {
							resError(res, "An Error Has Occured", 500)
						}
					})
				} else {
					resError(res, "Incorrect Password", 400)
				}
			} else {
				resError(res, "User Not Found", 400)
			}
		})
	} else {
		resError(res, "All fields must be filled out", 400)
	}
})

app.post('/signUp', function (req, res) {
	var form = req.body;
	if(form && form.username && form.email && form.firstName && form.lastName && form.birthday && form.password) {
		findDocuments("Users", {email:form.email}, function(usersWithEmail){
			if(usersWithEmail.length==0) {
				var newUser = {};
				newUser.username = form.username;
				newUser.salt = randomString(20);
				newUser.hash = sha512(form.password, newUser.salt);
				newUser.email = form.email;
				newUser.lowercaseEmail = form.email.toLowerCase();
				newUser.firstName = form.firstName;
				newUser.lastName = form.lastName;
				newUser.birthday = new Date(form.birthday);
				newUser.userType = 1;
				insertDocument("Users", newUser, function(result) {
					if(result) {
						resSuccess(res, "User Created");
					} else {
						resError(res, "An Error Has Occured", 500)
					}
				})
			} else {
				resError(res, "Account With Email Already Exists.", 400)
			}
		})
	} else {
		resError(res, "All fields must be filled out", 400)
	}
})

app.post('/addRide', function (req, res) {
	var form = req.body;
	if(form && form.startingNode && form.endingNode && form.vehicle) {
		findAdmin(req.get("authToken"), function(admin) {
			if(admin) {
				form.user = admin._id;
				addRide(form, res)
			} else {
				resError(res, "Account Not Found", 400);
			}
		})
	} else {
		resError(res, "All fields must be filled out", 400)
	}
})

app.post('/addCar', function (req, res) {
	var form = req.body;
	if(form && form.name) {
		findAdmin(req.get("authToken"), function(admin) {
			if(admin) {
				addCar(form, res)
			} else {
				resError(res, "Account Not Found", 400);
			}
		})
	} else {
		resError(res, "All fields must be filled out", 400)
	}
})

app.post('/addStation', function (req, res) {
	var form = req.body;
	if(form && form.name && form.location && form.location.length==2 && form.type) {
		findAdmin(req.get("authToken"), function(admin) {
			if(admin) {
				addStation(form, res)
			} else {
				resError(res, "Account Not Found", 400);
			}
		})
	} else {
		resError(res, "All fields must be filled out", 400)
	}
})

app.post('/addPath', function (req, res) {
	var form = req.body;
	if(form && form.startingNode && form.endingNode && form.length >= 0 && form.waypoints.length >= 0) {
		findAdmin(req.get("authToken"), function(admin) {
			if(admin) {
				addPath(form, res)
			} else {
				resError(res, "Account Not Found", 400);
			}
		})
	} else {
		resError(res, "All fields must be filled out", 400)
	}
})

var http = require('http').createServer(app);

var io = require('socket.io')(http);

var mostRecentAllCarsInfo;

io.on('connection', function(socket){
  
  socket.on('joinAllRidesInfo', function(authToken) {
	  findAdmin(authToken, function(admin){
		  if(admin) {
			  socket.join('allRidesInfo');
			  getAllRidesInfo(function(rides){
				  socket.emit('allRidesInfo',rides);
			  })
		  }
	  })
  })
  
  socket.on('joinAllCarsInfo', function(authToken) {
	  findAdmin(authToken, function(admin){
		  if(admin) {
			  socket.join('allCarsInfo');
			  getAllCarsInfo(function(carsInfo) {
				  socket.emit('allCarsInfo',carsInfo);
			  })
		  }
	  })
  })
  
  socket.on('joinAllStationsInfo', function(authToken) {
	  findAdmin(authToken, function(admin){
		  if(admin) {  
			  socket.join('allStationsInfo');
			  getAllStationsInfo(function(stations){
				  socket.emit('allStationsInfo',stations);
			  })
		  }
	  })
  })
  
  socket.on('joinAllPathsInfo', function(authToken) {
	  findAdmin(authToken, function(admin){
		  if(admin) {
		  	socket.join('allPathsInfo');
		  	getAllPathsInfo(function(paths){
				socket.emit('allPathsInfo',paths);
			})
		}
	  })
  })
});

http.listen(portToUse, function(){
	console.log("listening on port " + portToUse);
})

function getAllRidesInfo(callback) {
	findDocumentsWithFields("Rides", {currentTask: {$in : [0,1]}}, {}, {}, 0, function(rides){
		callback(rides);
	})
}

function getAllCarsInfo(callback) {
	findDocuments("Cars", {}, function(cars){
		callback(cars)
	})
}

function getAllStationsInfo(callback) {
	findDocumentsWithFields("Nodes", {}, {}, {}, 0, function(stations){
		callback(stations);
	})
}

function getAllPathsInfo(callback) {
	findDocumentsWithFields("Edges", {}, {}, {}, 0, function(edges){
		callback(edges);
	})
}

function addRide(form, res) {
	var newRide = {
		vehicleID : new mongo.ObjectID(form.vehicle),
		userID : form.user,
		startingNode : new mongo.ObjectID(form.startingNode),
		endingNodeNode : new mongo.ObjectID(form.startingNode),
		currentTask : 0
	}
	insertDocument("Rides", newRide, function(nr) {
		if(nr) {
			resSuccess(res, "Ride Added");
			getAllRidesInfo(function(carsInfo){
				io.to('allRidesInfo').emit('allRidesInfo',carsInfo);
			})
		} else {
			resError(res, "An Error Occured", 500);
		}
	})}

function addCar(form, res) {
	var newCar = {
		name : form.name,
	}
	findDocuments("Cars", {name:newCar.name}, function(carsWithSameName){
		if(carsWithSameName.length==0) {
			insertDocument("Cars", newCar, function(ns) {
				if(ns) {
					resSuccess(res, "Car Added");
					getAllCarsInfo(function(carsInfo){
						io.to('allCarsInfo').emit('allCarsInfo',carsInfo);
					})
				} else {
					resError(res, "An Error Occured", 500);
				}
			})
		} else {
			resError(res, "Car With Same Name Already Exists", 400);
		}
	})
}

function addStation(form, res) {
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
					getAllStationsInfo(function(allNodes){
						io.to('allStationsInfo').emit('allStationsInfo', allNodes);
					})
				} else {
					resError(res, "An Error Occured", 500);
				}
			})
		} else {
			resError(res, "Station With Same Name Already Exists", 400);
		}
	})
}

function addPath(form, res) {
	var newPath = {
		startingNode : new mongo.ObjectID(form.startingNode),
		endingNode : new mongo.ObjectID(form.endingNode),
		length : form.length,
		waypoints : []
	}
	findDocuments("Nodes", {_id:new mongo.ObjectID(form.startingNode)}, function(startingNode){
		findDocuments("Nodes", {_id:new mongo.ObjectID(form.endingNode)}, function(endingNode){
			if(startingNode[0] && endingNode[0]) {
				newPath.waypoints[0] = {
					coordinates:[startingNode[0].location[0], startingNode[0].location[1]]
				}
				for(var i=0;i<form.waypoints.length;i++) {
					newPath.waypoints[i+1] = {
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
				newPath.waypoints.push(
					{
						coordinates:[endingNode[0].location[0], endingNode[0].location[1]]
					}
				)
				insertDocument("Edges", newPath, function(np) {
					if(np) {
						resSuccess(res, "Path Added");
						getAllPathsInfo(function(allPaths){
							io.to('allPathsInfo').emit('allPathsInfo', allPaths);
						})
					} else {
						resError(res, "An Error Occured", 500);
					}
				})
			} else {
				resError(res, "Starting or Ending Point Does Not Exist", 400);
			}
		})
	})
}

function updateCar(newCar) {
	var newCarKeys = Object.keys(newCar);
	var newCarObj = {}
	for(var i=0;i<newCarKeys.length;i++) {
		if(newCarKeys[i]!="_id" && newCarKeys[i]!="name") {
			newCarObj[newCarKeys[i]] = newCar[newCarKeys[i]]
		}
	}
	updateDocument("Cars", {_id:newCar._id}, newCarObj, function(c){
		newCarObj.carID = newCar._id;
		insertDocument("carsHistory", newCarObj, function(nc){
			if(nc && c) {
				getAllCarsInfo(function(carsInfo){
					io.to('allCarsInfo').emit('allCarsInfo',carsInfo);
				})
			}
		})
	})
}

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

function findUser(authToken, callback) {
	if(authToken && typeof authToken == "string") {
		findDocuments("AuthTokens", {authToken:authToken}, function(matchingAuthTokens){
			if(matchingAuthTokens[0]) {
				findDocuments("Users", {_id:matchingAuthTokens[0]["userID"]}, function(user){
					if(user[0]) {
						callback(user[0]);
					} else {
						callback(false);
					}
				})
			} else {
				callback(false);
			}
		})
	} else {
		callback(false);
	}
}

function findAdmin(authToken, callback) {
	if(authToken && typeof authToken == "string") {
		findDocuments("AuthTokens", {authToken:authToken}, function(matchingAuthTokens){
			if(matchingAuthTokens[0]) {
				findDocuments("Users", {_id:matchingAuthTokens[0]["userID"], userType:0}, function(user){
					if(user[0]) {
						callback(user[0]);
					} else {
						callback(false);
					}
				})
			} else {
				callback(false);
			}
		})
	} else {
		callback(false);
	}
}

function randomString(length){
    return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length);
};

var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    return hash.digest('hex');
};

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

findDocuments("Users", {userType:0}, function(admins){
	if(admins.length==0) {
		var password = "admin";
		var newUser = {};
		newUser.username = "admin";
		newUser.salt = randomString(20);
		newUser.hash = sha512(password, newUser.salt);
		newUser.email = "admin@example.com";
		newUser.lowercaseEmail = newUser.email.toLowerCase();
		newUser.firstName = "Admin";
		newUser.lastName = "Admin";
		newUser.birthday = new Date();
		newUser.userType = 0;
		insertDocument("Users", newUser, function(result) {
			if(result) {
				console.log("admin@example.com admin created");
			} else {
				console.log("An error occured creating admin");
			}
		})
	}
})

function simulation() {
	setTimeout(simulation, 1000);
	findDocuments("Cars", {}, function(cars){
		for(var i=0;i<carsRunninginSimulation;i++) {
			(function(i) {
				findDocuments("Edges", {_id:cars[i].currentPath}, function(edge){
					var closestEdge = cars[i].nextWaypoint;
					var closestEdgeDist = geolib.getDistance({
						latitude:cars[i].currentLocation[0],
						longitude:cars[i].currentLocation[1]},
						{latitude:edge[0].waypoints[closestEdge].coordinates[0],
						longitude:edge[0].waypoints[closestEdge].coordinates[1]}
					)
					var bearing = geolib.getBearing({
						latitude:cars[i].currentLocation[0],
						longitude:cars[i].currentLocation[1]},
						{latitude:edge[0].waypoints[closestEdge].coordinates[0],
						longitude:edge[0].waypoints[closestEdge].coordinates[1]}
					)
					var dest = geolib.computeDestinationPoint({
						latitude:cars[i].currentLocation[0],
						longitude:cars[i].currentLocation[1]},
						distToTravelPerFrame, bearing
					);
					
					if(closestEdge==edge[0].waypoints.length-1 && distToTravelPerFrame>=closestEdgeDist) {
						findDocuments("Edges", {startingNode:edge[0].endingNode}, function(newEdge) {
							if(newEdge.length>0) {
								cars[i].nextWaypoint = 1;
								cars[i].currentPath = newEdge[Math.floor(Math.random() * newEdge.length)]["_id"];
								cars[i].currentLocation[0] = dest.latitude;
								cars[i].currentLocation[1] = dest.longitude;
								updateCar(cars[i]);
							}
						})
					} else if(distToTravelPerFrame>=closestEdgeDist) {
						cars[i].nextWaypoint++;
						cars[i].currentLocation[0] = dest.latitude;
						cars[i].currentLocation[1] = dest.longitude;
						updateCar(cars[i]);
					} else {
						cars[i].currentLocation[0] = dest.latitude;
						cars[i].currentLocation[1] = dest.longitude;
						updateCar(cars[i]);
					}
				})
			})(i)
		}
	})
}

if(runSimulation) {
	simulation()
}