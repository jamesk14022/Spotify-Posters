var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({'extended' : 'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type : 'application/vnd.api+json'}));

const URL = require('url');
const COVERSMAX = 72;

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
	clientId : '94b6c64210d14fc78e328d649819b63c',
	clientSecret : '9f4fc95e4f604d53bbc967b6c518e7fd',
	redirectUri : 'http://localhost:3000/auth_success'
});

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/auth_success', function(req, res){
	if(req.query.code){
		res.sendFile(path.join(__dirname, 'auth_success.html'));
	}else{
		res.sendFile(path.join(__dirname, 'index.html'));
	}
});

app.post('/api/auth', function(req, res){
	console.log('api/auth endpoint request');
	spotifyApi.authorizationCodeGrant(req.body[0].code)
	.then(function(data){
		// Set the access token on the API object to use it in later calls
	    spotifyApi.setAccessToken(data.body['access_token']);
	    spotifyApi.setRefreshToken(data.body['refresh_token']);
	    console.log('Tokens set');
	    res.sendStatus(200);
	}, function(err){
		console.log('Error when getting token.', err); 
		res.sendStatus(400);
	});
});

app.post('/api/songtrackart/urls', function(req, res){
	var urls = [];
	spotifyApi.getMySavedTracks({limit : 50})
	.then(function(data){
		for(var i = 0; i < data.body.items.length; i++){
			urls.push(data.body.items[i].track.album.images[0].url);
		}
		if(urls.length < COVERSMAX){
			spotifyApi.getMySavedTracks({limit : 50, offset : urls.length})
			.then(function(data){
				for(var i = 0; i < data.body.items.length; i++){
					urls.push(data.body.items[i].track.album.images[0].url);
				}
				sendUrls(urls);
			}, function(err){
				console.log('Error getting saved tracks', err);
			});
		}else{
			sendUrls(urls);
		}
	}, function(err){
		console.log('Error getting saved tracks', err);
	});

	function sendUrls(urls){
		uniqueUrls = urls.filter(function(item, pos, self) {
			return self.indexOf(item) == pos;
		});
		res.json(uniqueUrls);
	}
});

app.post('/api/albumtrackart/urls', function(req, res){
	spotifyApi.getMySavedTracks({limit : 50})
	.then(function(data){
		var urls = []
		for(var i = 0; i < data.body.items.length; i++){
			urls.push(data.body.items[i].track.album.images[0].url);
		}
		uniqueUrls = urls.filter(function(item, pos, self) {
			return self.indexOf(item) == pos;
		});
		res.json(uniqueUrls);
	}, function(err){
		console.log('Error getting saved tracks', err);
	});
});

app.post('/api/playlisttrackart/urls', function(req, res){
	var urls = [];
	var userId;
	spotifyApi.getPlaylist(req.body.owner, req.body.id)
    .then(function(dataInt) {
        for(var i = 0; i < dataInt.body.tracks.items.length; i++){
			urls.push(dataInt.body.tracks.items[i].track.album.images[0].url);
		}
		if(urls.length < COVERSMAX){
			spotifyApi.getPlaylist(req.body.owner, req.body.id, {limit : 50, offset : urls.length})
			.then(function(data){
				for(var i = 0; i < data.body.tracks.items.length; i++){
					urls.push(data.body.tracks.items[i].track.album.images[0].url);
				}
				sendUrls(urls);
			}, function(err){
				console.log('Error getting saved tracks', err);
			});
		}else{
			sendUrls(urls);
		}
    }, function(err) {
        console.log('Something went wrong!', err);
	});
	
	function sendUrls(urls){
		uniqueUrls = urls.filter(function(item, pos, self) {
			return self.indexOf(item) == pos;
		});
		res.json(uniqueUrls);
	}
});

app.post('/api/playlists', function(req, res){
	spotifyApi.getUserPlaylists()
	.then(function(data){
		res.json(data.body);
	}, function(err){
		console.log('Error getting playlists.', err);
	});
});

app.listen(3000, function(){
	console.log('API listening for connnections.')
});