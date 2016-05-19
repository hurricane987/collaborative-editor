var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const PORT = 8080;

app.use(express.static('site'));

app.get('/', function(req, res){
	res.sendFile('/Users/alex/Projects/collaboratr/site/index.html');
});

io.on('connection', function(socket){
	socket.on('CodeMirror', function(update){
		socket.broadcast.emit('CodeMirror', update);
	});
	socket.on('Users', function(newUser) {
		socket.broadcast.emit('Users', newUser);
		console.log(newUser);
	});
});

http.listen(PORT, function(){
	console.log('listening on ' + PORT);
});