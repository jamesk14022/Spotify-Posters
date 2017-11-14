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
		//ensures images fill all rows in the poster
		var rowLength = 6;
		var remainder = urls.length % rowLength;
		if(remainder !== 0){
			urls = urls.slice(0, urls.length - remainder);
		}

		var canvas = document.getElementById('poster');
		var ctx = canvas.getContext('2d');

		for(var i = 0; i < urls.length; i++){
			//render poster preview with boostrap
			var div = document.createElement('div');
			div.setAttribute('class', 'col-md-2');
			var img = document.createElement('img');
			img.setAttribute('src', urls[i]);
			img.setAttribute('class', 'cover');
			div.append(img);

			$('.image-container').append(div);

			img.onLoad = function(j = i){
				//render actual poster image(w/ merged images) onto a canvas
				var dx = 317;
				var dy = 287;
				var dWidth = (j % rowLength) * dx;
				var dHeight = Math.floor(j / rowLength) * dy;
				ctx.drawImage(img, dx, dy, dWidth, dHeight);
			} 
		}



		$('div.nav').show();
		$('#focus-options').hide();
		$('#playlist-options').hide();
		$('.list-playlists').hide();
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

$(document).ready(function(){
		var link = document.getElementById('download');
		link.setAttribute('download', 'MintyPaper.png');
		link.setAttribute('href', document.getElementById('poster').toDataURL("image/png").replace("image/png", "image/octet-stream"));
});