var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const PORT = 8080;

app.use(express.static('site'));

app.get('/', function(req, res){
	res.sendFile('/Users/alex/Projects/collaboratr/site/index.html');
});

io.on('connection', function(socket){
	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
	});
});

http.listen(PORT, function(){
	console.log('listening on ' + PORT);
})