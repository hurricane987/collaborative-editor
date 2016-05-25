angular.module('Collaboratr', ['ui.codemirror', 'ngDialog'])
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

    $scope.collabId = location.href.split('/')[3];

    //INITIALIZE SCOPE.DATA, CREATE USER ARRAY

    $scope.data = {};
    var socket = io();
    $scope.data.users = [];

    //CONFIGURE EDITOR

    $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        mode: 'javascript',
        readOnly: 'nocursor'
    };

    //MODES FOR SYNTAX HIGHLIGHTING

    $scope.modes = {'HTML': 'htmlmixed', 'CSS': 'css', 'JavaScript': 'javascript', 'PHP': 'php', 'Python': 'python', 'Ruby': 'ruby'};
    $scope.currentMode = $scope.modes.JavaScript;
    console.log($scope.editorOptions.mode);
    $scope.$watch('currentMode', function(){
        if($scope.data.users.length > 1 && !$scope.currentUser.hasWritePermission) {
            alert('cannot change mode without write permission!');
            return;
        } else {
            $scope.editorOptions.mode = $scope.currentMode;
            socket.emit('update-mode', {collabId: $scope.collabId, value: $scope.currentMode});   
        }  
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
        });
        socket.emit('update-users', {collabId: $scope.collabId, value: $scope.data.users});
    };
    
	//UPDATE TEXTAREA IN REALTIME

	$scope.$watch('data.textarea', function(update){
        if($scope.editorOptions.readOnly === false) {
            socket.emit('CodeMirror', {collabId: $scope.collabId, value: update});
        }
	});

	socket.on('CodeMirror#' + $scope.collabId, function(update){
		$scope.$apply(function(){$scope.data.textarea = update;});
	});

    //HANDLE MESSAGES

    $scope.messages = [];

    $scope.newMessage = '';

    $scope.sendMessage = function(message) {
        // $scope.messages.unshift("'" + $scope.currentUser.name + ": " + message + "'");
        socket.emit('new-message', {collabId: $scope.collabId, name: $scope.currentUser.name, value: message});
        $scope.newMessage = '';
    };

    socket.on('new-message#' + $scope.collabId, function(update) {
        $scope.$apply($scope.messages.unshift(update.name + ": " + update.value));
    });

    socket.on('refresh-messages#' + $scope.collabId, function(msgs) {
        $scope.$apply($scope.messages = msgs);
    });
}]);




















