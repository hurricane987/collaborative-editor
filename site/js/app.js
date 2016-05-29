angular.module('Collaboratr', ['ui.codemirror', 'ngDialog', 'ngAnimate'])
.config(['ngDialogProvider', function (ngDialogProvider) {
    ngDialogProvider.setDefaults({
        className: 'ngdialog-theme-default',
        template: 'dialog.html', 
        plain: false,
        showClose: false,
        closeByDocument: false,
        closeByEscape: false
    });
}])
.controller('CollabCtrl', ['$rootScope', '$scope', 'ngDialog', function($rootScope, $scope, ngDialog){	

    $scope.isLoaded = false;

    $scope.collabId = location.href.split('/')[3];

    //EVENT LISTENER FOR USER LEAVING

    window.addEventListener('beforeunload', function(data) {
        socket.emit('user-leave', {collabId: $scope.collabId, value: $scope.currentUser});
        console.log('!!');
    });

    //INITIALIZE SCOPE.DATA, CREATE USER ARRAY

    $scope.data = {users: [], messages: [], editor: {}};
    var socket = io();

    //CONFIGURE EDITOR

    $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        mode: $scope.data.currentMode,
        readOnly: 'nocursor'
    };

    socket.emit('init', {collabId: $scope.collabId});
    socket.once('init#' + $scope.collabId, function(data){
        $scope.data = data;
        if(!$scope.data.editor.currentMode){
            $scope.data.editor.currentMode = 'javascript';
        }
        $scope.isLoaded = true;
    });

    //MODES FOR SYNTAX HIGHLIGHTING

    $scope.modes = {'HTML': 'htmlmixed', 'CSS': 'css', 'JavaScript': 'javascript', 'PHP': 'php', 'Python': 'python', 'Ruby': 'ruby'};
    
    $scope.$watch('data.editor.currentMode', function(){
        $scope.editorOptions.mode = $scope.data.editor.currentMode;
        if ($scope.currentUser.hasWritePermission) {
            socket.emit('update-mode', {collabId: $scope.collabId, value: $scope.data.editor.currentMode});     
        }
    });
    
    socket.on('update-mode#' + $scope.collabId, function(update){
        $scope.$apply($scope.data.editor.currentMode = update);
        $scope.editorOptions.mode = $scope.data.editor.currentMode;
    });

	//POMPT USER FOR USERNAME, HANDLE USER CREATION

	$scope.dialog = function () {
        ngDialog.openConfirm({ 	
        					className: 'ngdialog-theme-default',
        					scope: $scope
        });
    };

    $scope.currentUser = {};

    $scope.createUser = function(name) {
    	$scope.currentUser = {name: name};
        socket.emit('join', {collabId: $scope.collabId, value: $scope.currentUser});
    };

    socket.on('refresh-users#' + $scope.collabId, function(usersList) {
        $scope.data.users = usersList;
        angular.forEach($scope.data.users, function(user){
            if (user.name === $scope.currentUser.name) {
                $scope.currentUser = user;
                $scope.editorOptions.readOnly = user.hasWritePermission ? false : 'nocursor';
            }
        });
        $scope.$digest();
    });

    //SWITCHING CONTROL OF EDITOR

    $scope.changeEditor = function(name) {
        if (!$scope.currentUser.hasWritePermission) {
            alert('You can\'t change the editor without permissions!');
            return;
        }
        angular.forEach($scope.data.users, function(user){
            user.hasWritePermission = (user.name === name);
            console.log(user);
        });
        socket.emit('update-users', {collabId: $scope.collabId, value: $scope.data.users});

        socket.emit('new-message', {collabId: $scope.collabId, value: name + ' is now the editor'});
    };
    
	//UPDATE TEXTAREA IN REALTIME

	$scope.$watch('data.editor.textarea', function(update){
        if($scope.editorOptions.readOnly === false) {
            socket.emit('CodeMirror', {collabId: $scope.collabId, value: update});
        }
	});

	socket.on('CodeMirror#' + $scope.collabId, function(update){
		$scope.$apply(function(){$scope.data.editor.textarea = update;});
	});

    //HANDLE MESSAGES

    $scope.newMessage = '';

    $scope.sendMessage = function(message) {
        socket.emit('new-message', {collabId: $scope.collabId, name: $scope.currentUser.name, value: message});
        $scope.newMessage = '';
    };

    socket.on('new-message#' + $scope.collabId, function(update) {
        var message = update.value;
        if(update.name) {
            message = update.name + ': ' + message;
        }
        $scope.$apply($scope.data.messages.push(message));
    });

    socket.on('refresh-messages#' + $scope.collabId, function(msgs) {
        $scope.$apply($scope.data.messages = msgs);
    });

    //MESSAGES GO FROM BOTTOM TO TOP
    
    window.setInterval(function() {
        var msgDiv = document.getElementById("message-div");
        msgDiv.scrollTop = msgDiv.scrollHeight;
    }, 250);
}]);

