var mapReady = false;
function initMap() {
	mapReady = true;
}
var app = angular.module('ecoprtApp', ["ngRoute"]);

// all the status that a ride can be in
var rideTasks = [
	"Waiting for Path",
	"In Transit",
	"Finished"
]

// all the different types that a node can bee
var stationTypes = [
	"Pickup Station",
	"Refuel Station",
	"Garage",
	"Regular Node"
]

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "templates/EcoPRT_Home_Page.html",
        controller : "homeCtrl"
    })
    .when("/signIn", {
        templateUrl : "templates/signIn.html",
        controller : "signInCtrl"
    })
    .when("/ecoPRTLogin", {
        templateUrl : "templates/EcoPRT_LogIn_Page.html",
        controller : "signInCtrl"
    })
    .when("/signUp", {
        templateUrl : "templates/signUp.html",
        controller : "signUpCtrl"
    })
    .when("/ecoPRTSignUp", {
        templateUrl : "templates/EcoPRT_SignUp_Page.html",
        controller : "signUpCtrl"
    })
    .when("/userHome", {
        templateUrl : "templates/userHome.html",
        controller : "userHomeCtrl"
    })
    .when("/adminHome", {
        templateUrl : "templates/adminHome.html",
        controller : "adminHomeCtrl"
    })
    .otherwise({
		templateUrl: 'templates/EcoPRT_Home_Page.html',
		controller: "homeCtrl"
    });
});

// Controller for the navigation bar that is present on all web pages
app.controller('navbarCtrl', function($scope, $location) {
	
	$scope.signOut = function() {
		localStorage["authToken"] = "";
		$location.path('/');
	}
	
	$scope.type = 0;
	
	if(window.location.hash == "#!/adminHome") {
		$scope.type = 1;
	}
		
	$scope.$on('$locationChangeSuccess', function(event) {
		$scope.type = 0;
	
		if(window.location.hash == "#!/adminHome") {
			$scope.type = 1;
		}
	});
});

// Controller for the Home Page
app.controller('homeCtrl', function($scope, $location) {

	if(localStorage["authToken"]) {
		$location.path('/userHome');
	}
	
	$scope.signIn = function() {
		$location.path('/signIn');
	}
	
	$scope.signUp = function() {
		$location.path('/signUp');
	}
});

// Controller for the Log In Page
app.controller('signInCtrl', function($scope, $http, $location) {

	if(localStorage["authToken"]) {
		$location.path('/userHome');
	}
	
	$scope.form={};
	$scope.home = function() {
		$location.path('/');
	}
	
	$scope.signIn = function() {
		if($scope.form.email && $scope.form.password) {
			return $http.post('/signIn', $scope.form)
			.then(function(result) { 
				localStorage["authToken"] = result.data;
				console.log(result.data);
				$location.path('/userHome');
			})
			.catch(function(error) {
				window.alert(error.data);
			});
		} else {
			window.alert("All Fields Must Be Filled Out")
		}
	}

});

// Controller for the Sign Up Page
app.controller('signUpCtrl', function($scope, $http, $location) {
	if(localStorage["authToken"]) {
		$location.path('/userHome');
	}
	
	$scope.form={};
	$scope.home = function() {
		$location.path('/');
	}
	
	$scope.signUp = function() {
		if($scope.form.username && $scope.form.password && $scope.form.firstName && $scope.form.lastName && $scope.form.birthday && $scope.form.password == $scope.form.confirmPassword) {
			return $http.post('/signUp', $scope.form)
			.then(function(result) { 
				window.alert(result.data);
				$location.path('/ecoPRTLogin');
			})
			.catch(function(error) {
				window.alert(error.data);
			});
		} else {
			window.alert("All Fields Must Be Filled Out")
		}
	}

});

// Controller for the Rider (non admin) user page
app.controller('userHomeCtrl', function($scope, $http, $location) {
	$http.get('/userInfo', {headers:{authToken:localStorage["authToken"]}})
	.then(function(result){
		if(result.data.userType == 0) {
			$location.path('/adminHome');
		}
		$scope.userInfo = result.data;
	}).catch(function(error) {
		window.alert(error.data);
	});
	
	$scope.signOut = function() {
		localStorage["authToken"] = "";
		$location.path('/');
	}
});

//////////////////////////////
// Controller for the Admin page
////////////////////////////
app.controller('adminHomeCtrl', function($scope, $http, $location, $sce, $compile) {
	
	$scope.currentView = 0;
	
	$scope.addingStationsOnMap = false;
	$scope.seletingStartNode = false;
	$scope.seletingEndNode = false;

	// What the add node page autofills the fields with
	$scope.newStation = {
		name : "",
		type : '0',
		location : []
	}
	$scope.newPathSet = false;
	$scope.newRideSet = false;
	$scope.newPath = {
		distance : 0,
		waypoints : []
	}
	
	$scope.newRide = {
		random : false
	}
	
	$scope.isCurrentlySelected = false;
	$scope.currentlySelectedName = "";
	$scope.currentlySelectedDesc = "";
	$scope.currentlySelectedLocation = [];
	$scope.currentlySelectedButtons = [];
	
	
	//new=true
	//edit=false
	$scope.newOrEdit = false;
	$scope.editID = "";
	
	$scope.resetNewPath = function() {
		if($scope.stations.length>0) {
			$scope.newPath = {
				startingNode : $scope.stations[0]._id,
				endingNode : $scope.stations[0]._id,
				distance : 0,
				waypoints : []
			}
		}
		document.getElementById("waypointsFile").value = '';
	}
	
	$scope.resetNewRide = function() {
		if($scope.stations.length>0 && $scope.vehicles.length>0) {
			$scope.newRide = {
				pickupNode : $scope.stations[0]._id,
				dropoffNode : $scope.stations[0]._id,
				vehicle : $scope.vehicles[0]._id,
				random : false
			}
		}
	}
	
	$scope.showHome = function() {
		$scope.currentView = 0;
	}

	$scope.showAddRidesForm = function() {
		$scope.newOrEdit = true;
		$scope.currentView = 1;
	}

	$scope.showAddvehiclesForm = function() {
		$scope.newOrEdit = true;
		$scope.currentView = 2;
	}
	
	$scope.showAddStationsForm = function() {
		$scope.newOrEdit = true;
		$scope.currentView = 3;
	}
	
	$scope.showAddPathsForm = function() {
		$scope.newOrEdit = true;
		$scope.currentView = 4;
	}

	$scope.showEditVehiclesForm = function(id) {
		$scope.newOrEdit = false;
		$scope.currentView = 2;
		$scope.editID = id;
		$scope.newVehicle = {
			name : $scope.vehicles[$scope.vehiclesMap[id]].name
		};
	}
	
	$scope.showEditStationsForm = function(id) {
		$scope.newOrEdit = false;
		$scope.currentView = 3;
		$scope.editID = id;
		console.log($scope.stations[$scope.stationsMap[id]]);
		$scope.newStation = {
			name:$scope.stations[$scope.stationsMap[id]].name,
			coordinates:$scope.stations[$scope.stationsMap[id]].coordinates,
			type:$scope.stations[$scope.stationsMap[id]].type.toString()
		};
	}
	
	$scope.showEditPathsForm = function(id) {
		$scope.newOrEdit = false;
		$scope.currentView = 4;
		$scope.editID = id;
		$scope.newPath = {
			startingNode:$scope.paths[$scope.pathsMap[id]].startingNode,
			endingNode:$scope.paths[$scope.pathsMap[id]].endingNode,
			distance:$scope.paths[$scope.pathsMap[id]].distance
		};
	}
	
	$scope.addRide = function() {
		if($scope.newRide) {
			$http.post("/addRide", $scope.newRide, {headers:{authToken:localStorage["authToken"]}}).then(
				function(response){
					window.alert(response.data.msg);
					$scope.resetNewRide();
					$scope.showHome();
				}, 
				function(error){
					window.alert(error.data);
				}
			);
		} else {
			window.alert("All fields must be filled out")
		}
	}
	
	$scope.addVehicle = function() {
		if($scope.newOrEdit) {
			if($scope.newVehicle && $scope.newVehicle.name) {
				$http.post("/addVehicle", $scope.newVehicle, {headers:{authToken:localStorage["authToken"]}}).then(
					function(response){
						window.alert(response.data.msg);
						$scope.newVehicle = {
							name : ""
						}
						$scope.showHome();
					}, 
					function(error){
						window.alert(error.data);
					}
				);
			} else {
				window.alert("All fields must be filled out")
			}
		} else {
			if($scope.newVehicle && $scope.newVehicle.name) {
				$http.post("/editVehicle", {id:$scope.editID, edits:$scope.newVehicle}, {headers:{authToken:localStorage["authToken"]}}).then(
					function(response){
						window.alert(response.data);
						$scope.newVehicle = {
							name : ""
						}
						$scope.showHome();
					}, 
					function(error){
						window.alert(error.data);
					}
				);
			} else {
				window.alert("All fields must be filled out")
			}
		}
	}
	
	$scope.addStation = function() {
		if($scope.newOrEdit) {
			if($scope.newStation && $scope.newStation.name && $scope.newStation.coordinates[0] && $scope.newStation.coordinates[1] && $scope.newStation.type>=0) {
				$http.post("/addStation", $scope.newStation, {headers:{authToken:localStorage["authToken"]}}).then(
					function(response){
						window.alert(response.data.msg);
						$scope.newStation = {
							name : "",
							type : '0',
							coordinates : []
						}
						$scope.showHome();
					}, 
					function(error){
						window.alert(error.data);
					}
				);
			} else {
				window.alert("All fields must be filled out")
			}
		} else {
			if($scope.newStation && $scope.newStation.name && $scope.newStation.coordinates[0] && $scope.newStation.coordinates[1] && $scope.newStation.type>=0) {
				$http.post("/editNode", {id:$scope.editID, edits:$scope.newStation}, {headers:{authToken:localStorage["authToken"]}}).then(
					function(response){
						window.alert(response.data);
						$scope.newStation = {
							name : "",
							type : '0',
							coordinates : []
						}
						$scope.showHome();
					}, 
					function(error){
						window.alert(error.data);
					}
				);
			} else {
				window.alert("All fields must be filled out")
			}
		}
	}
	
	$scope.addPath = function() {
		var file = document.getElementById("waypointsFile").files[0];
		if($scope.newOrEdit) {
			if(file) {
				var aReader = new FileReader();
				aReader.readAsText(file, "UTF-8");
				aReader.onload = function(evt) {
					$scope.wayPointsText = aReader.result;
					try {
						$scope.wayPoints = JSON.parse($scope.wayPointsText);
						if(Array.isArray($scope.wayPoints)) {
							$scope.newPath.waypoints = $scope.wayPoints;
							if($scope.newPath && $scope.newPath.startingNode && $scope.newPath.endingNode && $scope.newPath.distance >= 0 && $scope.newPath.waypoints.length > 0) {
								$http.post("/addPath", $scope.newPath, {headers:{authToken:localStorage["authToken"]}}).then(
									function(response){
										window.alert(response.data.msg);
										$scope.resetNewPath();
										$scope.showHome();
									}, 
									function(error){
										window.alert(error.data);
									}
								);
							} else {
								//window.alert("All fields must be filled out")
								window.alert("Please Fill Out All Fields");
							}
						} else {
							window.alert("Invalid File Format 1");
						}
					} catch(e) {
						window.alert("Invalid File Format 2");
					}
				}
			} else {
				window.alert("Please Sumbit a File");
			}
		} else {
			if(file) {
				var aReader = new FileReader();
				aReader.readAsText(file, "UTF-8");
				aReader.onload = function(evt) {
					$scope.wayPointsText = aReader.result;
					try {
						$scope.wayPoints = JSON.parse($scope.wayPointsText);
						if(Array.isArray($scope.wayPoints)) {
							$scope.newPath.waypoints = $scope.wayPoints;
							if($scope.newPath && $scope.newPath.startingNode && $scope.newPath.endingNode && $scope.newPath.distance >= 0 && $scope.newPath.waypoints.length > 0) {
								$http.post("/editEdge", {id:$scope.editID, edits:$scope.newPath}, {headers:{authToken:localStorage["authToken"]}}).then(
									function(response){
										window.alert(response.data);
										$scope.resetNewPath();
										$scope.showHome();
									}, 
									function(error){
										window.alert(error.data);
									}
								);
							} else {
								//window.alert("All fields must be filled out")
								window.alert("Please Fill Out All Fields");
							}
						} else {
							window.alert("Invalid File Format 1");
						}
					} catch(e) {
						window.alert("Invalid File Format 2");
					}
				}
			} else {
				$http.post("/editEdge", {id:$scope.editID, edits:$scope.newPath}, {headers:{authToken:localStorage["authToken"]}}).then(
					function(response){
						window.alert(response.data);
						$scope.resetNewPath();
						$scope.showHome();
					}, 
					function(error){
						window.alert(error.data);
					}
				);
			}
		}
	}
	
	$scope.changeEnableVehicle = function(id, newValue) {
		$http.post("/editVehicle", {id:id, edits:{enabled:newValue}}, {headers:{authToken:localStorage["authToken"]}}).then(
			function(response){
				
			}, 
			function(error){
				window.alert(error.data);
			}
		);
	}
	
	$scope.deleteNode = function(id) {
		if(confirm("Do you wish to delete this node?")) {
			$http.post("/deleteNode", {id:id}, {headers:{authToken:localStorage["authToken"]}}).then(
				function(response){
					window.alert(response.data);
					location.reload();
				}, 
				function(error){
					window.alert(error.data);
				}
			);
		}
	}
	
	$scope.deleteEdge = function(id) {
		if(confirm("Do you wish to delete this edge?")) {
			$http.post("/deleteEdge", {id:id}, {headers:{authToken:localStorage["authToken"]}}).then(
				function(response){
					window.alert(response.data);
					location.reload();
				}, 
				function(error){
					window.alert(error.data);
				}
			);
		}
	}
	
	$scope.deleteVehicle = function(id) {
		if(confirm("Do you wish to delete this vehicle?")) {
			$http.post("/deleteVehicle", {id:id}, {headers:{authToken:localStorage["authToken"]}}).then(
				function(response){
					window.alert(response.data);
					location.reload();
				}, 
				function(error){
					window.alert(error.data);
				}
			);
		}
	}
	
	$scope.rideTasks = rideTasks;
	$scope.stationTypes = stationTypes;
	$http.get('/userInfo', {headers:{authToken:localStorage["authToken"]}})
	.then(function(result){
		if(result.data.userType == 1) {
			$location.path('/userHome');
		}
		$scope.userInfo = result.data;
		$("[data-collapse-group]").on('show.bs.collapse', function () {
			var $this = $(this);
			var thisCollapseAttr = $this.attr('data-collapse-group');
			$("[data-collapse-group='" + thisCollapseAttr + "']").not($this).collapse('hide');
		});
	})
	.catch(function(error) {
		window.alert(error.data);
	});
	
	$scope.map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 35.7708942, lng: -78.674699},
		zoom: 18
	});
	
	$scope.contextmenuDir = null;
	
	$scope.createNodeFromMap = function() {
		$scope.newStation.coordinates = [$scope.mapLat,$scope.mapLng];
		$scope.showAddStationsForm();
		$('#contextmenuClickable').css('visibility', 'hidden');
	}
	
	//http://googleapitips.blogspot.com/p/google-maps-api-v3-context-menu-example.html
	$scope.getCanvasXY = function(caurrentLatLng){
		var scale = Math.pow(2, $scope.map.getZoom());
		var nw = new google.maps.LatLng(
			$scope.map.getBounds().getNorthEast().lat(),
			$scope.map.getBounds().getSouthWest().lng()
		);
		var worldCoordinateNW = $scope.map.getProjection().fromLatLngToPoint(nw);
		var worldCoordinate = $scope.map.getProjection().fromLatLngToPoint(caurrentLatLng);
		var caurrentLatLngOffset = new google.maps.Point(
			Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
			Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
		);
		return caurrentLatLngOffset;
	}
	
	$scope.setMenuXY = function(caurrentLatLng){
		var mapWidth = $('#map').width();
		var mapHeight = $('#map').height();
		var menuWidth = $('.contextmenu').width();
		var menuHeight = $('.contextmenu').height();
		var clickedPosition = $scope.getCanvasXY(caurrentLatLng);
		var x = clickedPosition.x ;
		var y = clickedPosition.y ;
		
		if((mapWidth - x ) < menuWidth) x = x - menuWidth;
		if((mapHeight - y ) < menuHeight) y = y - menuHeight;
		
		console.log(x, y);
		$('.contextmenu').css('left',x + $('#map').width());
		$('.contextmenu').css('top',y);
		$('.contextmenu').css('position','relative');
		$('.contextmenu').css('background','#ffffff');
		$('.contextmenu').css('z-index',100);
		$('.contextmenu').css('display','inline-block');
	};
	
	$scope.showContextMenu = function(caurrentLatLng) {
		$scope.mapLat = caurrentLatLng.lat();
		$scope.mapLng = caurrentLatLng.lng();
		console.log(caurrentLatLng);
		var projection;
		var contextmenuDir;
		projection = $scope.map.getProjection() ;
		$('.contextmenu').remove();
		$scope.contextmenuDir = document.createElement("div");
		$scope.contextmenuDir.className  = 'contextmenu';
		var trustedHtml = $sce.trustAsHtml("<a onclick='createNodeFromMap()'>Create New Node Here<\/a>");
		var compiledHtml = $compile(trustedHtml)($scope);
		$($scope.map.getDiv()).append($scope.contextmenuDir);
		
		$scope.setMenuXY(caurrentLatLng);
		
		$scope.contextmenuDir.style.visibility = "visible";
		$('#contextmenuClickable').css('left', $('.contextmenu')[0].getBoundingClientRect().x)
		$('#contextmenuClickable').css('top', $('.contextmenu')[0].getBoundingClientRect().y)
		$('#contextmenuClickable').css('visibility', 'visible');
	}
	
	google.maps.event.addListener($scope.map, 'click', function (event) {
		var lat = event.latLng.lat();
		var lng = event.latLng.lng();
		if($scope.addingStationsOnMap) {
			$scope.newStation.coordinates = [lat,lng];
			$scope.addingStationsOnMap = false;
		}
		$scope.seletingStartNode = false;
		$scope.seletingEndNode = false;
		$('#contextmenuClickable').css('visibility', 'hidden');
	});
	google.maps.event.addListener($scope.map, "contextmenu",function(event){$scope.showContextMenu(event.latLng);});

	// use Shift Click to create a new node
	var selecting = false;

	window.onkeydown = function(e) {
	selecting = ((e.key == 'Shift') || (e.keyIdentifier == 'Shift') || (e.shiftKey == true));
	}
	window.onkeyup = function(e) {
	selecting = false;
	}
	google.maps.event.addListener($scope.map, "click",function(event){
		console.log(selecting);
		if(selecting){
			$scope.showContextMenu(event.latLng);
		}
		});

	
	$scope.signOut = function() {
		localStorage["authToken"] = "";
		$location.path('/');
	}
	
	// Image for the vehicle
	$scope.vehicleicon = {
	    url: "images/vehicle2.png", // url
	    scaledSize: new google.maps.Size(25, 25),
        anchor: new google.maps.Point(12.5,12.5) // move the origin to center of image
	};
	
	// Image for a selected vehicle
	$scope.selectedVehicleicon = {
	    url: "images/vehicle2selected.png", // url
	    scaledSize: new google.maps.Size(25, 25),
        anchor: new google.maps.Point(12.5,12.5) // move the origin to center of image
	};
	
	// Image for the nodes
	$scope.stationicon = {
	    url: "images/place2.png", // url
	    scaledSize: new google.maps.Size(13, 13),
        anchor: new google.maps.Point(6.5, 6.5), // moves origin to center of image

//        origin: new google.maps.Point(0,0), // origin
//        anchor: new google.maps.Point(0, 0) // anchor
	};
	
	$scope.selectedStationicon = {
	    url: "images/place2selected.png", // url
	    scaledSize: new google.maps.Size(13, 13),
        anchor: new google.maps.Point(6.5, 6.5), // moves origin to center of image

//        origin: new google.maps.Point(0,0), // origin
//        anchor: new google.maps.Point(0, 0) // anchor
	};
	
	$scope.resetIcons = function() {
		for(var i=0;i<$scope.vehicles.length;i++) {
			if($scope.currentlySelectedId != $scope.vehicles[i]._id && $scope.markers[$scope.vehicles[i]["_id"]]) {
				var newIcon = JSON.parse(JSON.stringify($scope.vehicleicon));
				newIcon.url = RotateIcon
		            .makeIcon(
		                'images/vehicle2.png')
		            .setRotation({deg: -Math.degrees($scope.vehicles[i].headingAngle)})
		            .getUrl()
				$scope.markers[$scope.vehicles[i]["_id"]].setIcon(newIcon);
			} else if($scope.currentlySelectedId == $scope.vehicles[i]._id && $scope.markers[$scope.vehicles[i]["_id"]]) {
				var newIcon = JSON.parse(JSON.stringify($scope.selectedVehicleicon));
				newIcon.rotation = Math.degrees($scope.vehicles[i].headingAngle);
				newIcon.url = RotateIcon
		            .makeIcon(
		                'images/vehicle2selected.png')
		            .setRotation({deg: -Math.degrees($scope.vehicles[i].headingAngle)})
		            .getUrl()
				$scope.markers[$scope.vehicles[i]["_id"]].setIcon(newIcon);
			}
		}
		for(var i=0;i<$scope.stations.length;i++) {
			if($scope.currentlySelectedId != $scope.stations[i]._id && $scope.markers[$scope.stations[i]["_id"]]) {
				$scope.markers[$scope.stations[i]["_id"]].setIcon($scope.stationicon);
			}
		}
	}
	
	$scope.resetMap = function() {
		$scope.markers = {};
		$scope.lines = [];
		$scope.infoWindows = [];
		$scope.infoMarkers = [];
	}
	$scope.resetMap();
	
	$scope.updateMap = function() {
		var oldLines = []
		for(var i=0;i<$scope.lines.length;i++) {
			oldLines.push($scope.lines[i])
		}
		$scope.lines = [];
		for(var i=0;i<$scope.vehicles.length;i++) {
			if($scope.vehicles[i]._id == $scope.currentlySelectedId) {
				$scope.currentlySelectedLocation = $scope.vehicles[i].coordinates;
			}
			if($scope.vehicles[i].coordinates && $scope.vehicles[i].coordinates[0] && $scope.vehicles[i].coordinates[1]) {
				var location = {lat:$scope.vehicles[i].coordinates[0],lng:$scope.vehicles[i].coordinates[1]};
				if($scope.markers[$scope.vehicles[i]["_id"]]) {
					$scope.markers[$scope.vehicles[i]["_id"]].setPosition(location)
				} else {
					var marker = new google.maps.Marker({
			        	position: location,
			        	icon: $scope.vehicleicon,
						map: $scope.map,
						title:$scope.vehicles[i].name,
						disableAutoPan: true
					});
					(function(i, marker) {
						// Code to add an info window when a icon is clicked on
						// Got rid of this in favor for the info bar
						// Code is here incase you need to add it later. 
						/*var contentString = '<p><b>' + $scope.vehicles[i].name + '</b><br/>' 
						+ 'Battery: ' + $scope.vehicles[i].batteryLife.toString() +'%' +'<br/>'
						+ 'Speed: ' + $scope.vehicles[i].speed.toString() + '<br/>' 
						+ 'Enabled?: ' + $scope.vehicles[i].enabled.toString() + '</p>';
	
						// + '<p>' + 'Lat: ' + $scope.stations[i].location[0].toString()
						// + ', Long: ' + $scope.stations[i].location[1].toString() + '</p>'
						// + '<p>Station Type: ' + stationTypes[$scope.stations[i].type]  + '</p></div>';
						
						var infowindow = new google.maps.InfoWindow({
							content: contentString
						});
						$scope.infoMarkers[$scope.vehicles[i]["_id"]] = infowindow;
						marker.addListener('click', function(){
							//$scope.stationClicked($scope.vehicles[i]["_id"])
							var infoMarkerKeys = Object.keys($scope.infoMarkers);
							for(var j=0;j<infoMarkerKeys.length;j++) {
								$scope.infoMarkers[infoMarkerKeys[j]].close();
							}
							infowindow.open($scope.map, marker);
						});*/
						marker.addListener('click', function(){
							marker.setIcon($scope.selectedVehicleicon);
							$scope.isCurrentlySelected = true;
							$scope.currentlySelectedId = $scope.vehicles[i]._id;
							$scope.currentlySelectedName = $scope.vehicles[i].name;
							$scope.currentlySelectedDesc = ["Battery:" + $scope.vehicles[i].batteryLife.toString() +"%","Speed: " + $scope.vehicles[i].speed.toString(),"Enabled?: " + $scope.vehicles[i].enabled.toString()].join("\n");
							$scope.currentlySelectedLocation = $scope.vehicles[i].coordinates;
							$scope.currentlySelectedButtons = [
								{icon:"fa-minus-circle", fn:function(){$scope.deleteVehicle($scope.vehicles[i]._id);$scope.currentlySelectedId = "";$scope.isCurrentlySelected = false;}},
								{icon:"fa-edit", fn: function(){$scope.showEditVehiclesForm($scope.vehicles[i]._id)}}
							];
							$scope.resetIcons();
							$scope.$apply();
						});
					})(i, marker)
			        // var infowindow = new google.maps.InfoWindow({
				    //     content: $scope.vehicles[i].name
					// });
			        // infowindow.open($scope.map, marker);
			        //$scope.markers.push(marker);
			        $scope.markers[$scope.vehicles[i]["_id"]] = marker;
			        // $scope.infoWindows.push(infowindow);
				}
			}
		}
		
		for(var i=0;i<$scope.paths.length;i++) {
			var path = [];
			for(var j=0;j<$scope.paths[i].waypoints.length;j++) {
				path.push({lat:$scope.paths[i].waypoints[j].coordinates[0],lng:$scope.paths[i].waypoints[j].coordinates[1]})
			}
			if($scope.currentlySelectedId != $scope.paths[i]._id) {
				var line = new google.maps.Polyline({
		        	path: path,
			        geodesic: true,
					strokeColor: '#FF0000',
					strokeOpacity: 1.0,
					strokeWeight: 2,
					map: $scope.map
		        });
		        $scope.lines.push(line);
		        (function(i, line, path) {
			        line.addListener('click', function(){
				        line.setOptions({strokeColor: '#00FF00'})
						$scope.isCurrentlySelected = true;
						$scope.currentlySelectedId = $scope.paths[i]._id;
						$scope.currentlySelectedName = $scope.stations[$scope.stationsMap[$scope.paths[i].startingNode]].name + " -> " + $scope.stations[$scope.stationsMap[$scope.paths[i].endingNode]].name;
						$scope.currentlySelectedDesc = "";
						$scope.currentlySelectedLocation = $scope.paths[i].waypoints[Math.floor($scope.paths[i].waypoints.length/2)].coordinates;
						$scope.currentlySelectedButtons = [
							{icon:"fa-minus-circle", fn:function(){$scope.deleteEdge($scope.paths[i]._id);$scope.isCurrentlySelected = false;}},
							{icon:"fa-edit", fn: function(){$scope.showEditPathsForm($scope.paths[i]._id)}}
						];
						$scope.resetIcons();
						$scope.$apply();
						$scope.updateMap();
					});
				})(i, line, path);
			} else {
				var line = new google.maps.Polyline({
		        	path: path,
			        geodesic: true,
					strokeColor: '#00FF00',
					strokeOpacity: 1.0,
					strokeWeight: 2,
					map: $scope.map
		        });
		        $scope.lines.push(line);
		        (function(i, line, path) {
			        line.addListener('click', function(){
						$scope.isCurrentlySelected = true;
						$scope.currentlySelectedId = $scope.paths[i]._id;
						$scope.currentlySelectedName = $scope.stations[$scope.stationsMap[$scope.paths[i].startingNode]].name + " -> " + $scope.stations[$scope.stationsMap[$scope.paths[i].endingNode]].name;
						$scope.currentlySelectedDesc = "";
						$scope.currentlySelectedLocation = $scope.paths[i].waypoints[Math.floor($scope.paths[i].waypoints.length/2)].coordinates;
						$scope.currentlySelectedButtons = [
							{icon:"fa-minus-circle", fn:function(){$scope.deleteEdge($scope.paths[i]._id);$scope.isCurrentlySelected = false;}},
							{icon:"fa-edit", fn: function(){$scope.showEditPathsForm($scope.paths[i]._id)}}
						];
						$scope.resetIcons();
						$scope.$apply();
					});
				})(i, line, path);
			}
		}
		
		for(var i=0;i<$scope.stations.length;i++) {
			if($scope.stations[i].coordinates) {
				var location = {lat:$scope.stations[i].coordinates[0],lng:$scope.stations[i].coordinates[1]};
				if($scope.markers[$scope.stations[i]["_id"]]) {
					$scope.markers[$scope.stations[i]["_id"]].setPosition(location)
				} else {
					var marker = new google.maps.Marker({
			        	position: location,
			        	icon: $scope.stationicon,
						map: $scope.map,
						disableAutoPan: true
			        });
			        (function(i, marker) {
						/*var contentString = '<p>' + '<b>' + $scope.stations[i].name + '</b>' +'<br/><br/>' 
						+ 'Lat: ' + $scope.stations[i].coordinates[0].toString() + '<br/>'
						+ 'Long: ' + $scope.stations[i].coordinates[1].toString() + '<br/>' 
						+ 'Station Type: ' + stationTypes[$scope.stations[i].type] + '</p>';
	
						// + '<p>' + 'Lat: ' + $scope.stations[i].location[0].toString()
						// + ', Long: ' + $scope.stations[i].location[1].toString() + '</p>'
						// + '<p>Station Type: ' + stationTypes[$scope.stations[i].type]  + '</p></div>';
						
				        var infowindow = new google.maps.InfoWindow({
							// content: $scope.stations[i].name
							content: contentString
						});
						$scope.infoMarkers[$scope.stations[i]["_id"]] = infowindow;
			        	marker.addListener('click', function(){
				        	$scope.stationClicked($scope.stations[i]["_id"])
				        	var infoMarkerKeys = Object.keys($scope.infoMarkers);
				        	for(var j=0;j<infoMarkerKeys.length;j++) {
					        	$scope.infoMarkers[infoMarkerKeys[j]].close();
				        	}
				        	infowindow.open($scope.map, marker);
				        });*/
				        marker.addListener('click', function(){
					        marker.setIcon($scope.selectedStationicon);
							$scope.isCurrentlySelected = true;
							$scope.currentlySelectedId = $scope.stations[i]._id;
							$scope.currentlySelectedName = $scope.stations[i].name;
							$scope.currentlySelectedDesc = "Station Type: " + stationTypes[$scope.stations[i].type];
							$scope.currentlySelectedLocation = $scope.stations[i].coordinates;
							$scope.currentlySelectedButtons = [
								{icon:"fa-minus-circle", fn:function(){$scope.deleteNode($scope.stations[i]._id);$scope.isCurrentlySelected = false;}},
								{icon:"fa-edit", fn: function(){$scope.showEditStationsForm($scope.stations[i]._id)}}
							];
							$scope.resetIcons();
							$scope.$apply();
						});
			        })(i, marker)
			        $scope.markers[$scope.stations[i]["_id"]] = marker;
				}
			}
		}
		
		setTimeout(function(){$scope.clearOldMap(oldLines)},10);
	}
	
	$scope.stationClicked = function(stationID) {
		if($scope.seletingStartNode) {
			$scope.newPath.startingNode = stationID;
		} else if($scope.seletingEndNode) {
			$scope.newPath.endingNode = stationID;
		}
		$scope.seletingStartNode = false;
		$scope.seletingEndNode = false;
	}
	
	$scope.clearOldMap = function(oldLines) {
		
		for(var i=0;i<oldLines.length;i++) {
			oldLines[i].setMap(null);
		}
		
		oldLines = [];
	}
	
	$scope.socket = io();
	
	$scope.rides = [];
	$scope.vehicles = [];
	$scope.stations = [];
	$scope.paths = [];
	
	$scope.socket.on("allRidesInfo", function(rides) {
		/*console.log("---All Rides Begin---");
		console.log(rides);
		console.log("---All Rides End---");*/
		$scope.rides = rides;
		$scope.$apply();
		$scope.updateMap();
	});
	
	$scope.socket.on("allStationsInfo", function(stations) {
		/*console.log("---All Stations Begin---");
		console.log(stations);
		console.log("---All Stations End---");*/
		$scope.stations = stations;
		$scope.stationsMap = [];
		for(var i=0;i<$scope.stations.length;i++) {
			$scope.stationsMap[$scope.stations[i]["_id"]] = i;
		}
		$scope.$apply();
		$scope.updateMap();
		if(!$scope.newPathSet) {
			$scope.resetNewPath();
		}
		if($scope.newRideSet && !$scope.newPathSet) {
			$scope.resetNewRide();
		}
		$scope.newPathSet = true;
	});
	
	$scope.socket.on("allEdgesInfo", function(paths) {
		/*console.log("---All Paths Begin---");
		console.log(paths);
		console.log("---All Paths End---");*/
		$scope.paths = paths;
		$scope.pathsMap = [];
		for(var i=0;i<$scope.paths.length;i++) {
			$scope.pathsMap[$scope.paths[i]["_id"]] = i;
		}
		$scope.$apply();
		$scope.updateMap();
	});
	
	$scope.socket.on("allVehiclesInfo", function(vehicles) {
		/*console.log("---All vehicles Begin---");
		console.log(vehicles);
		console.log("---All vehicles End---");*/
		$scope.vehicles = vehicles;
		$scope.vehiclesMap = [];
		for(var i=0;i<$scope.vehicles.length;i++) {
			$scope.vehiclesMap[$scope.vehicles[i]["_id"]] = i;
		}
		$scope.$apply();
		$scope.updateMap();
		$scope.resetIcons();
		if(!$scope.newRideSet && $scope.newPathSet) {
			$scope.resetNewRide();
		}
		$scope.newRideSet = true;
	});
	
	$scope.socket.emit("joinAllRidesInfo",localStorage["authToken"]);
	$scope.socket.emit("joinAllVehiclesInfo",localStorage["authToken"]);
	$scope.socket.emit("joinAllStationsInfo",localStorage["authToken"]);
	$scope.socket.emit("joinallEdgesInfo",localStorage["authToken"]);
	
	$scope.startPlaceStation = function() {
		$scope.addingStationsOnMap = true;
	}
	
	$scope.beginSelectStartNode = function() {
		$scope.seletingStartNode = !$scope.seletingStartNode;
		$scope.seletingEndNode = false;
	}
	
	$scope.beginSelectEndNode = function() {
		$scope.seletingEndNode = !$scope.seletingEndNode;
		$scope.seletingStartNode = false;
	}
	
	$scope.closeCurrentlySelected = function() {
		$scope.isCurrentlySelected = false;
		$scope.currentlySelectedId = null;
		$scope.updateMap();
		$scope.resetIcons();
	}
});

//////////////////////////
// End of Admin controller
////////////////////////

Math.degrees = function(radians) {
	return radians * 180 / Math.PI;
}

//////////////////////////////////
// Rotates the vehicle icon based on the heading angle
///////////////////////////////////////
var RotateIcon = function(options){
    this.options = options || {};
    this.rImg = options.img || new Image();
    this.rImg.src = this.rImg.src || this.options.url || '';
    this.options.width = this.options.width || this.rImg.width || 52;
    this.options.height = this.options.height || this.rImg.height || 60;
    var canvas = document.createElement("canvas");
    canvas.width = this.options.width;
    canvas.height = this.options.height;
    this.context = canvas.getContext("2d");
    this.canvas = canvas;
};
RotateIcon.makeIcon = function(url) {
    return new RotateIcon({url: url});
};
RotateIcon.prototype.setRotation = function(options){
    var canvas = this.context,
        angle = options.deg ? options.deg * Math.PI / 180:
            options.rad,
        centerX = this.options.width/2,
        centerY = this.options.height/2;

    canvas.clearRect(0, 0, this.options.width, this.options.height);
    canvas.save();
    canvas.translate(centerX, centerY);
    canvas.rotate(angle);
    canvas.translate(-centerX, -centerY);
    canvas.drawImage(this.rImg, 0, 0);
    canvas.restore();
    return this;
};
RotateIcon.prototype.getUrl = function(){
    return this.canvas.toDataURL('image/png');
};