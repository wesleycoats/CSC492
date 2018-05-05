//Draw every X waypoints
var edgeResolution = 1;

var runSimulation = true;
var vehiclesRunninginSimulation = 3;
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

/////////////////////////
// REST Functions
/////////////////////////

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
	if(form && form.pickupNode && form.dropoffNode) {
		if(form.random) form.vehicle = null;
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

app.post('/addvehicle', function (req, res) {
	var form = req.body;
	if(form && form.name) {
		findAdmin(req.get("authToken"), function(admin) {
			if(admin) {
				addVehicle(form, res)
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
	if(form && form.name && form.coordinates && form.coordinates.length==2 && form.type) {
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
	if(form && form.startingNode && form.endingNode && form.distance >= 0 && form.waypoints.length >= 0) {
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

app.post('/editNode', function (req, res) {
	var form = req.body;
	if(form && form.id && form.edits) {
		findAdmin(req.get("authToken"), function(admin) {
			if(admin) {
				editNode(form, res)
			} else {
				resError(res, "Account Not Found", 400);
			}
		})
	} else {
		resError(res, "All fields must be filled out", 400)
	}
})

app.post('/editEdge', function (req, res) {
	var form = req.body;
	if(form && form.id && form.edits) {
		findAdmin(req.get("authToken"), function(admin) {
			if(admin) {
				editEdge(form, res)
			} else {
				resError(res, "Account Not Found", 400);
			}
		})
	} else {
		resError(res, "All fields must be filled out", 400)
	}
})

app.post('/editVehicle', function (req, res) {
	var form = req.body;
	if(form && form.id && form.edits) {
		findAdmin(req.get("authToken"), function(admin) {
			if(admin) {
				editVehicle(form, res)
			} else {
				resError(res, "Account Not Found", 400);
			}
		})
	} else {
		resError(res, "All fields must be filled out", 400)
	}
})

app.post('/deleteNode', function (req, res) {
	var form = req.body;
	if(form && form.id) {
		findAdmin(req.get("authToken"), function(admin) {
			if(admin) {
				deleteNode(form, res)
			} else {
				resError(res, "Account Not Found", 400);
			}
		})
	} else {
		resError(res, "All fields must be filled out", 400)
	}
})

app.post('/deleteEdge', function (req, res) {
	var form = req.body;
	if(form && form.id) {
		findAdmin(req.get("authToken"), function(admin) {
			if(admin) {
				deleteEdge(form, res)
			} else {
				resError(res, "Account Not Found", 400);
			}
		})
	} else {
		resError(res, "All fields must be filled out", 400)
	}
})

app.post('/deleteVehicle', function (req, res) {
	var form = req.body;
	if(form && form.id) {
		findAdmin(req.get("authToken"), function(admin) {
			if(admin) {
				deleteVehicle(form, res)
			} else {
				resError(res, "Account Not Found", 400);
			}
		})
	} else {
		resError(res, "All fields must be filled out", 400)
	}
})

/////////////////////////
// End of REST functions
/////////////////////////


//////////////////////
// Socket Functions
/////////////////////

var http = require('http').createServer(app);

var io = require('socket.io')(http);

var mostRecentAllVehiclesInfo;

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
  
  socket.on('joinAllVehiclesInfo', function(authToken) {
	  findAdmin(authToken, function(admin){
		  if(admin) {
			  socket.join('allVehiclesInfo');
			  getAllVehiclesInfo(function(vehiclesInfo) {
				  socket.emit('allVehiclesInfo',vehiclesInfo);
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
  
  socket.on('joinallEdgesInfo', function(authToken) {
	  findAdmin(authToken, function(admin){
		  if(admin) {
		  	socket.join('allEdgesInfo');
		  	getallEdgesInfo(function(paths){
				socket.emit('allEdgesInfo',paths);
			})
		}
	  })
  })
});

///////////////////////////
// End of Socket Functions
//////////////////////////

http.listen(portToUse, function(){
	console.log("listening on port " + portToUse);
})

/////////////////////////
// Helper functions
/////////////////////////

function getAllRidesInfo(callback) {
	findDocumentsWithFields("Rides", {currentTask: {$in : [0,1]}}, {}, {}, 0, function(rides){
		callback(rides);
	})
}

function getAllVehiclesInfo(callback) {
	findDocuments("Vehicles", {}, function(vehicles){
		callback(vehicles)
	})
}

function getAllStationsInfo(callback) {
	findDocumentsWithFields("Nodes", {}, {}, {}, 0, function(stations){
		callback(stations);
	})
}

function getallEdgesInfo(callback) {
	findDocumentsWithFields("Edges", {}, {}, {}, 0, function(edges){
		for(var i=0;i<edges.length;i++) {
			if(edges[i].waypoints && edges[i].waypoints.length>0) {
				var ret = [];
				ret.push(edges[i].waypoints[0]);
				for(var j=edgeResolution;j<edges[i].waypoints.length-1;j+=edgeResolution) {
					if(edges[i].waypoints[j]) {
						ret.push(edges[i].waypoints[j]);
					}
				}
				ret.push(edges[i].waypoints[edges[i].waypoints.length-1]);
				edges[i].waypoints = ret;
			}
		}
		callback(edges);
	})
}

function addRide(form, res) {
	var vehicleID = null;
	if(!form.random)vehicleID=new mongo.ObjectID(form.vehicle)
	var newRide = {
		vehicleID : vehicleID,
		userID : form.user,
		pickupNode : new mongo.ObjectID(form.pickupNode),
		dropoffNode : new mongo.ObjectID(form.dropoffNode),
		currentTask : 0
	}
	insertDocument("Rides", newRide, function(nr) {
		if(nr) {
			resSuccess(res, {"id":nr.insertedIds[0], "msg": "Ride Added"});
			getAllRidesInfo(function(vehiclesInfo){
				io.to('allRidesInfo').emit('allRidesInfo',vehiclesInfo);
			})
		} else {
			resError(res, "An Error Occured", 500);
		}
	})}

function addVehicle(form, res) {
	var newVehicle = {
		name : form.name,
		enabled : false
	}
	findDocuments("Vehicles", {name:newVehicle.name}, function(vehiclesWithSameName){
		if(vehiclesWithSameName.length==0) {
			insertDocument("Vehicles", newVehicle, function(ns) {
				if(ns) {
					resSuccess(res, {"id":ns.insertedIds[0], "msg": "vehicle Added"});
					getAllVehiclesInfo(function(vehiclesInfo){
						io.to('allVehiclesInfo').emit('allVehiclesInfo',vehiclesInfo);
					})
				} else {
					resError(res, "An Error Occured", 500);
				}
			})
		} else {
			resError(res, "vehicle With Same Name Already Exists", 400);
		}
	})
}

function addStation(form, res) {
	var newStation = {
		name : form.name,
		coordinates : [form.coordinates[0], form.coordinates[1]],
		type : +form.type
	}
	findDocuments("Nodes", {name:newStation.name}, function(stationsWithSameName){
		if(stationsWithSameName.length==0) {
			insertDocument("Nodes", newStation, function(ns) {
				if(ns) {
					resSuccess(res, {"id":ns.insertedIds[0], "msg":"Station Added"});
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
		distance : form.distance,
		waypoints : []
	}
	findDocuments("Nodes", {_id:new mongo.ObjectID(form.startingNode)}, function(startingNode){
		findDocuments("Nodes", {_id:new mongo.ObjectID(form.endingNode)}, function(endingNode){
			if(startingNode[0] && endingNode[0]) {
				for(var i=0;i<form.waypoints.length;i++) {
					newPath.waypoints[i] = {
						coordinates : [form.waypoints[i].coordinates[0], form.waypoints[i].coordinates[1]],
						speed : form.waypoints[i].speed,
						headingAngle : form.waypoints[i].headingAngle,
						steeringAngle : form.waypoints[i].steeringAngle,
						timeStamp : new Date(form.waypoints[i].timeStamp),
						tick : form.waypoints[i].tick,
						actuator : form.waypoints[i].actuator,
						motorControlFlags : form.waypoints[i].motorControlFlags,
						motorThrottle : form.waypoints[i].motorThrottle
					}
				}
				insertDocument("Edges", newPath, function(np) {
					if(np) {
						resSuccess(res, {"id":np.insertedIds[0], "msg": "Path Added"});
						getallEdgesInfo(function(allPaths){
							io.to('allEdgesInfo').emit('allEdgesInfo', allPaths);
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

function editNode(form, res) {
	form.edits.type = +form.edits.type;
	updateDocument("Nodes", {_id: new mongo.ObjectID(form.id)}, form.edits, function(editedStation){
		if(editedStation) {
			resSuccess(res, "Station Edited");
			getAllStationsInfo(function(allNodes){
				io.to('allStationsInfo').emit('allStationsInfo', allNodes);
			})
		} else {
			resError(res, "An Error Occured", 500);
		}
	})
}

function editEdge(form, res) {
	
	var newPath = {};
	if(form.edits.startingNode) newPath.startingNode = new mongo.ObjectID(form.edits.startingNode);
	if(form.edits.endingNode) newPath.endingNode = new mongo.ObjectID(form.edits.endingNode);
	if(form.edits.distance>=0) newPath.distance = form.edits.distance
	if(form.edits.waypoints) {
		newPath.waypoints = [];
		for(var i=0;i<form.edits.waypoints.length;i++) {
			newPath.waypoints[i] = {
				coordinates : [form.edits.waypoints[i].coordinates[0], form.edits.waypoints[i].coordinates[1]],
				speed : form.edits.waypoints[i].speed,
				headingAngle : form.edits.waypoints[i].headingAngle,
				steeringAngle : form.edits.waypoints[i].steeringAngle,
				timeStamp : new Date(form.edits.waypoints[i].timeStamp),
				tick : form.edits.waypoints[i].tick,
				actuator : form.edits.waypoints[i].actuator,
				motorControlFlags : form.edits.waypoints[i].motorControlFlags,
				motorThrottle : form.edits.waypoints[i].motorThrottle
			}
		}
	}
	updateDocument("Edges", {_id: new mongo.ObjectID(form.id)}, newPath, function(editedEdge){
		if(editedEdge) {
			resSuccess(res, "Edge Edited");
			getallEdgesInfo(function(allPaths){
				io.to('allEdgesInfo').emit('allEdgesInfo', allPaths);
			})
		} else {
			resError(res, "An Error Occured", 500);
		}
	})
}

function editVehicle(form, res) {
	updateDocument("Vehicles", {_id: new mongo.ObjectID(form.id)}, form.edits, function(editedVehicle){
		if(editedVehicle) {
			resSuccess(res, "Vehicle Edited");
			getAllVehiclesInfo(function(vehiclesInfo){
				io.to('allVehiclesInfo').emit('allVehiclesInfo',vehiclesInfo);
			})
		} else {
			resError(res, "An Error Occured", 500);
		}
	})
}

function deleteNode(form, res) {
	deleteDocument("Nodes", {_id: new mongo.ObjectID(form.id)}, function(deletedStation){
		if(deletedStation) {
			resSuccess(res, "Station Deleted");
			getAllStationsInfo(function(allNodes){
				io.to('allStationsInfo').emit('allStationsInfo', allNodes);
			})
		} else {
			resError(res, "An Error Occured", 500);
		}
	})
}

function deleteEdge(form, res) {
	deleteDocument("Edges", {_id: new mongo.ObjectID(form.id)}, function(deletedEdge){
		if(deletedEdge) {
			resSuccess(res, "Edge Deleted");
			getallEdgesInfo(function(allPaths){
				io.to('allEdgesInfo').emit('allEdgesInfo', allPaths);
			})
		} else {
			resError(res, "An Error Occured", 500);
		}
	})
}

function deleteVehicle(form, res) {
	deleteDocument("Vehicles", {_id: new mongo.ObjectID(form.id)}, function(deletedVehicle){
		if(deletedVehicle) {
			resSuccess(res, "Vehicle Deleted");
			getAllVehiclesInfo(function(vehiclesInfo){
				io.to('allVehiclesInfo').emit('allVehiclesInfo',vehiclesInfo);
			})
		} else {
			resError(res, "An Error Occured", 500);
		}
	})
}

function updateVehicle(newVehicle) {
	var newVehicleKeys = Object.keys(newVehicle);
	var newVehicleObj = {}
	for(var i=0;i<newVehicleKeys.length;i++) {
		if(newVehicleKeys[i]!="_id" && newVehicleKeys[i]!="name") {
			newVehicleObj[newVehicleKeys[i]] = newVehicle[newVehicleKeys[i]]
		}
	}
	updateDocument("Vehicles", {_id:newVehicle._id}, newVehicleObj, function(c){
		newVehicleObj.vehicleID = newVehicle._id;
		insertDocument("vehiclesHistory", newVehicleObj, function(nc){
			if(nc && c) {
				getAllVehiclesInfo(function(vehiclesInfo){
					io.to('allVehiclesInfo').emit('allVehiclesInfo',vehiclesInfo);
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

/////////////////////////
// End of Mongo Funtions
////////////////////////

// Code to the run the simulation
// Vehicles will choose the closest edge and have the vehicle move along it
function simulation() {
	setTimeout(simulation, 1000);
	findDocuments("Vehicles", {}, function(vehicles){
		for(var i=0;i<vehiclesRunninginSimulation;i++) {
			(function(i) {
				findDocuments("Edges", {_id:vehicles[i].currentPath}, function(edge){
					var closestEdge = vehicles[i].nextWaypoint;
					var closestEdgeDist = geolib.getDistance({
						latitude:vehicles[i].coordinates[0],
						longitude:vehicles[i].coordinates[1]},
						{latitude:edge[0].waypoints[closestEdge].coordinates[0],
						longitude:edge[0].waypoints[closestEdge].coordinates[1]}
					)
					var bearing = geolib.getBearing({
						latitude:vehicles[i].coordinates[0],
						longitude:vehicles[i].coordinates[1]},
						{latitude:edge[0].waypoints[closestEdge].coordinates[0],
						longitude:edge[0].waypoints[closestEdge].coordinates[1]}
					)
					var dest = geolib.computeDestinationPoint({
						latitude:vehicles[i].coordinates[0],
						longitude:vehicles[i].coordinates[1]},
						distToTravelPerFrame, bearing
					);
					
					if(closestEdge==edge[0].waypoints.length-1 && distToTravelPerFrame>=closestEdgeDist) {
						findDocuments("Edges", {startingNode:edge[0].endingNode}, function(newEdge) {
							if(newEdge.length>0) {
								vehicles[i].nextWaypoint = 1;
								vehicles[i].currentPath = newEdge[Math.floor(Math.random() * newEdge.length)]["_id"];
								vehicles[i].coordinates[0] = dest.latitude;
								vehicles[i].coordinates[1] = dest.longitude;
								updateVehicle(vehicles[i]);
							}
						})
					} else if(distToTravelPerFrame>=closestEdgeDist) {
						vehicles[i].nextWaypoint++;
						vehicles[i].coordinates[0] = dest.latitude;
						vehicles[i].coordinates[1] = dest.longitude;
						updateVehicle(vehicles[i]);
					} else {
						vehicles[i].coordinates[0] = dest.latitude;
						vehicles[i].coordinates[1] = dest.longitude;
						updateVehicle(vehicles[i]);
					}
				})
			})(i)
		}
	})
}

if(runSimulation) {
	simulation()
}

function updateVehicleLocation() {
	getAllVehiclesInfo(function(vehiclesInfo){
		io.to('allVehiclesInfo').emit('allVehiclesInfo',vehiclesInfo);
		setTimeout(updateVehicleLocation, 1000);
	})
}
updateVehicleLocation();
