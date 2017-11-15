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

		for(var i = 0; i < urls.length; i++){
			var img = document.createElement('img');
			img.crossOrigin = 'anonymous';
			img.data = { 
				j : i
			}
			img.onload = function(){
				//render actual poster image(w/ merged images) onto a canvas
				var dx = 317;
				var dy = 287;
				var dWidth = (this.data.j % rowLength) * dx;
				var dHeight = Math.floor(this.data.j / rowLength) * dy;
				document.getElementById('poster').getContext('2d').drawImage(this, dWidth, dHeight, dx, dy);
			} 
			img.setAttribute('src', urls[i]);
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

//hacky method to make sure canvas download is prepper only after all uimages are acctuallyinserted
$(document).ready(function(){
	function dataURLtoBlob(dataurl) {
	    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
	        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
	    while(n--){
	        u8arr[n] = bstr.charCodeAt(n);
	    }
	    return new Blob([u8arr], {type:mime});
	}
	setTimeout(function(){
		var link = document.getElementById('download');
		var imgData = document.getElementById('poster').toDataURL({format: 'png', multiplier: 4});
		var strDataURI = imgData.substr(22, imgData.length);
		var blob = dataURLtoBlob(imgData);
      	var objurl = URL.createObjectURL(blob);

      	link.href = objurl;
    	link.download = 'poster';
    	link.click();
	}, 4000);
});