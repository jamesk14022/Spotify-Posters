var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({'extended' : 'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type : 'application/vnd.api+json'}));

const URL = require('url');

var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
	clientId : '94b6c64210d14fc78e328d649819b63c',
	clientSecret : '9f4fc95e4f604d53bbc967b6c518e7fd',
	redirectUri : 'http://localhost:3000/nodealbumcollation'
});

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('api/auth', function(req, res){
	console.log('api/auth endpoint request');
	console.log(req.body[0]);

	spotifyApi.authorizationCodeGrant(req.body[0].code)
		.then(function(data){
			// Set the access token on the API object to use it in later calls
		    spotifyApi.setAccessToken(data.body['access_token']);
		    spotifyApi.setRefreshToken(data.body['refresh_token']);
		    console.log('Tokens set');
		}, function(err){
			console.log('Error when getting token.', err); 
	});
});

app.listen(3000, function(){
	console.log('API listening for connnections.')
});