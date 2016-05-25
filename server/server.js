var express = require('express');
var shortid = require('shortid');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var users = {};
var messages = [];
const PORT = 8080;

app.use('/:id', express.static('site'));
app.get('/', function(req, res){
	res.statusCode = 302;
  	res.setHeader('Location', '/' + shortid.generate());
  	res.end();
})

io.on('connection', function(socket){

	socket.on('CodeMirror', function(data){
		socket.broadcast.emit('CodeMirror#' + data.collabId, data.value);
	});

	socket.on('join', function(data) {
		if(!users.hasOwnProperty(data.collabId)){
			users[data.collabId] = [];
		};
		var currentUsers = users[data.collabId];
		data.value.hasWritePermission = (currentUsers.length === 0);
		currentUsers.push(data.value);

		//UPDATE USERS LIST ON JOIN
		io.sockets.emit('refresh-users#' + data.collabId, currentUsers);

		//UPDATE MESSAGES ON JOIN
		if(currentUsers.length > 1){
			messages.unshift(data.value.name + ' is now chillin');
			io.sockets.emit('refresh-messages#' + data.collabId, messages);
		}
	});
	
	socket.on('update-users', function (data) {
		if(!users.hasOwnProperty(data.collabId)){
			console.log('Something is very wrong...');
		}
		users[data.collabId] = data.value;
		io.sockets.emit('refresh-users#' + data.collabId, data.value);
	});

	socket.on('new-message', function(data) {
		messages.unshift(data.name + ": " + data.value);
		io.sockets.emit('new-message#' + data.collabId, {name: data.name, value: data.value});
	});

	// socket.on('disconnect', function(socket) {
	// 	users[data.collabId] + ' has left';
	// 	io.sockets.emit('refresh-messages#' + data.collabId, messages);
	// 	console.log(users[data.collabId] + ' has left');
	// });
});

http.listen(process.env.PORT || PORT, function(){
	console.log('listening on ' + process.env.PORT || PORT);
});