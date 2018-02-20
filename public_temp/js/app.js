var app = angular.module('ecoprtApp', []);

app.controller('nodesCtrl', function($scope, $http) {
	$scope.newNode = {
		location : []
	};
	
	$http.get('/getNodes')
	.then(function(result){
		$scope.nodes = result.data;
	}).catch(function(error) {
		window.alert(error.data);
	});
	
	$scope.addNode = function() {
		if($scope.newNode && $scope.newNode.name && $scope.newNode.location[0] && $scope.newNode.location[1] && $scope.newNode.type>=0) {
			$http.post("/addNode", $scope.newNode).then(
				function(response){
					window.alert(response.data);
					location.reload();
				}, 
				function(error){
					window.alert(error.data);
				}
			);
		} else {
			window.alert("All fields must be filled out")
		}
	}
});

app.controller('vehiclesCtrl', function($scope, $http) {
	$scope.newVehicle = {};
	
	$http.get('/getVehicles')
	.then(function(result){
		$scope.vehicles = result.data;
	}).catch(function(error) {
		window.alert(error.data);
	});
	
	$scope.addVehicle = function() {
		if($scope.newVehicle && $scope.newVehicle.name) {
			$http.post("/addVehicle", $scope.newVehicle).then(
				function(response){
					window.alert(response.data);
					location.reload();
				}, 
				function(error){
					window.alert(error.data);
				}
			);
		} else {
			window.alert("All fields must be filled out")
		}
	}
});

app.controller('edgesCtrl', function($scope, $http) {
	$scope.newEdge = {
		waypoints : []
	};
	
	$http.get('/getEdges')
	.then(function(result){
		$scope.edges = result.data;
	}).catch(function(error) {
		window.alert(error.data);
	});
	
	$scope.addEdge = function() {
		
		if($scope.newEdge && $scope.newEdge.startingNode && $scope.newEdge.endingNode && $scope.newEdge.distance) {
			$http.post("/addEdge", $scope.newEdge).then(
				function(response){
					window.alert(response.data);
					location.reload();
				}, 
				function(error){
					window.alert(error.data);
				}
			);
		} else {
			window.alert("All fields must be filled out")
		}
	}
});

app.controller('ridesCtrl', function($scope, $http) {
	$scope.newRide = {
		pathChosen : [],
		passengerLocation : []
	};
	
	$http.get('/getRides')
	.then(function(result){
		$scope.rides = result.data;
	}).catch(function(error) {
		window.alert(error.data);
	});
	
	$scope.addRide = function() {
		
		if($scope.newRide && $scope.newRide.numberOfPassengers && $scope.newRide.pathChosen && $scope.newRide.passengerLocation[0] && $scope.newRide.passengerLocation[1] && $scope.newRide.distance && $scope.newRide.vehicleID && $scope.newRide.userID && $scope.newRide.startingNode && $scope.newRide.endingNode && $scope.newRide.currentTask) {
			$http.post("/addRide", $scope.newRide).then(
				function(response){
					window.alert(response.data);
					location.reload();
				}, 
				function(error){
					window.alert(error.data);
				}
			);
		} else {
			window.alert("All fields must be filled out")
		}
	}
});