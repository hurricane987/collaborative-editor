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
		users[socket.id] = newUser;
		if (users.length === 0) {
			newUser.hasWritePermission = true;
		} else {
			newUser.hasWritePermission = false;
		};
		if (newUser.hasWritePermission) {
			io.sockets.emit('update-permissions');
		};
		users.push(newUser);
		io.sockets.emit('update-users', users);
	});

	socket.on('change-editor', function(name) {
		if(users[socket.id] === name) {
			users[socket.id].hasWritePermission = true;
		} else {
			users[socket.id].hasWritePermission = false;
		};
		if (users[socket.id].hasWritePermission) {
			io.sockets.emit('update-permissions');
		};
	});
});

http.listen(PORT, function(){
	console.log('listening on ' + PORT);
});