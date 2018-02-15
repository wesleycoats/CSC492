var mapReady = false;
function initMap() {
	mapReady = true;
}
var app = angular.module('ecoprtApp', ["ngRoute"]);

var rideTasks = [
	"Waiting for Path",
	"In Transit",
	"Finished"
]

var stationTypes = [
	"Pickup Station",
	"Refuel Station",
	"Garage"
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
				$location.path('/signIn');
			})
			.catch(function(error) {
				window.alert(error.data);
			});
		} else {
			window.alert("All Fields Must Be Filled Out")
		}
	}

});

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

app.controller('adminHomeCtrl', function($scope, $http, $location) {
	
	$scope.currentView = 0;
	
	$scope.addingStationsOnMap = false;
	$scope.newStation = {
		name : "",
		type : '0',
		location : []
	}
	$scope.newPathSet = false;
	$scope.newPath = {
		length : 0,
		waypoints : []
	}
	
	$scope.resetNewPath = function() {
		$scope.newPath = {
			startingNode : $scope.stations[0]._id,
			endingNode : $scope.stations[0]._id,
			length : 0,
			waypoints : []
		}
	}
	
	$scope.showHome = function() {
		$scope.currentView = 0;
	}
	
	$scope.showAddCarsForm = function() {
		$scope.currentView = 2;
	}
	
	$scope.showAddStationsForm = function() {
		$scope.currentView = 3;
	}
	
	$scope.showAddPathsForm = function() {
		$scope.currentView = 4;
	}
	
	$scope.addCar = function() {
		if($scope.newCar && $scope.newCar.name) {
			$http.post("/addCar", $scope.newCar, {headers:{authToken:localStorage["authToken"]}}).then(
				function(response){
					window.alert(response.data);
					$scope.newCar = {
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
	
	$scope.addStation = function() {
		if($scope.newStation && $scope.newStation.name && $scope.newStation.location[0] && $scope.newStation.location[1] && $scope.newStation.type>=0) {
			$http.post("/addStation", $scope.newStation, {headers:{authToken:localStorage["authToken"]}}).then(
				function(response){
					window.alert(response.data);
					$scope.newStation = {
						name : "",
						type : '0',
						location : []
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
	
	$scope.addPath = function() {
		if($scope.newPath && $scope.newPath.startingNode && $scope.newPath.endingNode && $scope.newPath.length >= 0 && $scope.newPath.waypoints.length > 0) {
			$http.post("/addPath", $scope.newPath, {headers:{authToken:localStorage["authToken"]}}).then(
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
			window.alert("This doesn't work yet try again later ;)")
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
	
	google.maps.event.addListener($scope.map, 'click', function (event) {
		var lat = event.latLng.lat();
		var lng = event.latLng.lng();
		if($scope.addingStationsOnMap) {
			$scope.newStation.location = [lat,lng];
			$scope.addingStationsOnMap = false;
		}
	});
	
	$scope.signOut = function() {
		localStorage["authToken"] = "";
		$location.path('/');
	}
	
	$scope.caricon = {
	    url: "images/car.png", // url
	    scaledSize: new google.maps.Size(50, 50)
	};
	
	$scope.stationicon = {
	    url: "images/ds9.jpg", // url
	    scaledSize: new google.maps.Size(50, 50)
	};
	
	$scope.markers = {};
	$scope.lines = [];
	$scope.infoWindows = []
	
	$scope.updateMap = function() {
		var oldLines = []
		for(var i=0;i<$scope.lines.length;i++) {
			oldLines.push($scope.lines[i])
		}
		$scope.lines = [];
		for(var i=0;i<$scope.cars.length;i++) {
			if($scope.cars[i].currentLocation && $scope.cars[i].currentLocation[0] && $scope.cars[i].currentLocation[1]) {
				var location = {lat:$scope.cars[i].currentLocation[0],lng:$scope.cars[i].currentLocation[1]};
				if($scope.markers[$scope.cars[i]["_id"]]) {
					$scope.markers[$scope.cars[i]["_id"]].setPosition(location)
				} else {
					var marker = new google.maps.Marker({
			        	position: location,
			        	icon: $scope.caricon,
						map: $scope.map,
						title:$scope.cars[i].name
			        });
			        var infowindow = new google.maps.InfoWindow({
				        content: $scope.cars[i].name
			        });
			        infowindow.open($scope.map, marker);
			        //$scope.markers.push(marker);
			        $scope.markers[$scope.cars[i]["_id"]] = marker;
			        $scope.infoWindows.push(infowindow);
				}
			}
		}
		
		for(var i=0;i<$scope.paths.length;i++) {
			var path = [];
			for(var j=0;j<$scope.paths[i].waypoints.length;j++) {
				path.push({lat:$scope.paths[i].waypoints[j].coordinates[0],lng:$scope.paths[i].waypoints[j].coordinates[1]})
			}
			var line = new google.maps.Polyline({
	        	path: path,
		        geodesic: true,
				strokeColor: '#FF0000',
				strokeOpacity: 1.0,
				strokeWeight: 2,
				map: $scope.map
	        });
	        $scope.lines.push(line);
		}
		
		for(var i=0;i<$scope.stations.length;i++) {
			var location = {lat:$scope.stations[i].location[0],lng:$scope.stations[i].location[1]};
			if($scope.markers[$scope.stations[i]["_id"]]) {
				$scope.markers[$scope.stations[i]["_id"]].setPosition(location)
			} else {
				var marker = new google.maps.Marker({
		        	position: location,
		        	icon: $scope.stationicon,
					map: $scope.map
		        });
		        $scope.markers[$scope.stations[i]["_id"]] = marker;
			}
		}
		
		setTimeout(function(){$scope.clearOldMap(oldLines)},10);
	}
	
	$scope.clearOldMap = function(oldLines) {
		
		for(var i=0;i<oldLines.length;i++) {
			oldLines[i].setMap(null);
		}
		
		oldLines = [];
	}
	
	$scope.socket = io();
	
	$scope.rides = [];
	$scope.cars = [];
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
			$scope.newPathSet = true;
			$scope.resetNewPath();
		}
	});
	
	$scope.socket.on("allPathsInfo", function(paths) {
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
	
	$scope.socket.on("allCarsInfo", function(cars) {
		/*console.log("---All Cars Begin---");
		console.log(cars);
		console.log("---All Cars End---");*/
		$scope.cars = cars;
		$scope.$apply();
		$scope.updateMap();
	});
	
	$scope.socket.emit("joinAllRidesInfo",localStorage["authToken"]);
	$scope.socket.emit("joinAllCarsInfo",localStorage["authToken"]);
	$scope.socket.emit("joinAllStationsInfo",localStorage["authToken"]);
	$scope.socket.emit("joinAllPathsInfo",localStorage["authToken"]);
	
	$scope.startPlaceStation = function() {
		$scope.addingStationsOnMap = true;
	}
});