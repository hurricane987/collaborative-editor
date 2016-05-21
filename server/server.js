var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var users = [];
const PORT = 8080;

app.use(express.static('site'));

app.get('/', function(req, res){
	res.sendFile('/Users/alex/Projects/collaboratr/site/index.html');
});

io.on('connection', function(socket){
	socket.on('CodeMirror', function(update){
		socket.broadcast.emit('CodeMirror', update);
	});

	socket.on('join', function(newUser) {
		newUser.hasWritePermission = (users.length === 0);
		users.push(newUser);
		io.sockets.emit('refresh-users', users);
	});
	
	socket.on('update-users', function (updatedUsers) {
		users = updatedUsers;
		io.sockets.emit('refresh-users', users);
	});
});

http.listen(PORT, function(){
	console.log('listening on ' + PORT);
});