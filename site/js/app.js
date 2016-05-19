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

	//POMPT USER FOR USERNAME

	$scope.dialog = function () {
        ngDialog.openConfirm({ 	
        					className: 'ngdialog-theme-default',
        					scope: $scope
        });
    };

    $scope.addUser = function(username) {
    	var ID = Math.round(Math.random() * 10000);
    	if ($scope.data.users.length === 0) {
    		$scope.data.users.push({name: username, ID: ID, hasWritePermission: true});
    	} else {
    		$scope.data.users.push({name: username, ID: ID, hasWritePermission: false});
    	}
    	console.log($scope.data.users);
    }

  	//INITIALIZE SCOPE.DATA, HANDLE USER STUFF

	$scope.data = {};
	var socket = io();
	$scope.data.users = [];

	//MODES FOR SYNTAX HIGHLIGHTING

	$scope.modes = {'HTML': 'htmlmixed', 'CSS': 'css', 'JavaScript': 'javascript', 'PHP': 'php', 'Python': 'python', 'Ruby': 'ruby'};
	$scope.currentMode = $rootScope.currentMode = $scope.modes.JavaScript;

	$scope.$watch('currentMode', function(){
		$scope.editorOptions.mode = $scope.currentMode;
	});

	//INTERACT WITH SOCKET.IO

	$scope.$watch('data.textarea', function(update){
		socket.emit('CodeMirror', update);
	});

	socket.on('CodeMirror', function(update){
		$scope.$apply(function(){$scope.data.textarea = update});
	});

	$scope.$watch('data.users', function(newUser){
		socket.emit('Users', newUser);
	});

	socket.on('Users', function(newUser){
		$scope.$apply(function(){$scope.data.users.push(newUser)});
	});

	//CONFIGURE EDITOR

	$scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        mode: $rootScope.currentMode
    };
}]);




















