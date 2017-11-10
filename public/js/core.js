var app = angular.module('posters', []).config(function($locationProvider) { $locationProvider.html5Mode(true); });

app.controller('mainController', ['$scope', '$http', '$location', '$compile', function($scope, $http, $location, $compile) {
	$scope.data = [
		{code: $location.search().code}
	];

	var send = $http.post('/api/auth', $scope.data);
	send.then(function(response){
		console.log(response.data);
	});

	$scope.getSavedTracks = function(){
		var send = $http.post('/api/songtrackart/urls');
		send.then(function(response){
			if(response.data){
				$scope.insertCoverArt(response.data);
			}
		});
	}

	$scope.getPlaylistTracks = function(playlistId){
		var data = {
			id : playlistId
		}
		var send = $http.post('/api/playlisttrackart/urls', data);
		send.then(function(response){
			if(response.data){
				$scope.insertCoverArt(response.data);
			}
		});
	}

	$scope.insertCoverArt = function(urls){
		console.log(urls);
		for(var i = 0; i < urls.length; i++){
			var div = document.createElement('div');
			div.setAttribute('class', 'col-md-2');

			var img = document.createElement('img');
			img.setAttribute('src', urls[i]);
			img.setAttribute('class', 'cover');
			div.append(img);

			$('.image-container').append(div);
			$('#focus-options').hide();
			$('#playlist-options').hide();
			$('.list-playlists').hide();
		}
	}

	$scope.showUserPlaylists = function(){
		var send = $http.post('/api/playlists');
		send.then(function(response){
			$('#focus-options').hide();
			for(var i = 0; i < response.data.items.length; i++){
				var plId = response.data.items[i].id;
				var plName = response.data.items[i].name;
				var li = $('<li class="list-group-item" ng-click="getPlaylistTracks(\'' + plId + '\');">' +  plName + '</li>');
				$compile(li)($scope);
				$('.list-playlists').append(li);
			}
		});
	}
}]);