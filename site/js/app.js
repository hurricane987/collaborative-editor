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

    //INITIALIZE SCOPE.DATA, CREATE USER ARRAY

    $scope.data = {};
    var socket = io();
    $scope.data.users = [];

    //CONFIGURE EDITOR

    $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        mode: $rootScope.currentMode,
        readOnly: 'nocursor'
    };

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
        socket.emit('join', $scope.currentUser);
    };

    socket.on('refresh-users', function(usersList) {
        $scope.data.users = usersList;
        angular.forEach($scope.data.users, function(user){
            if (user.name === $scope.currentUser.name) {
                $scope.editorOptions.readOnly = user.hasWritePermission ? false : 'nocursor';
            }
        });
        $scope.$apply();
        $scope.$digest();
        console.log($scope.data.users);
    });

	//MODES FOR SYNTAX HIGHLIGHTING

	$scope.modes = {'HTML': 'htmlmixed', 'CSS': 'css', 'JavaScript': 'javascript', 'PHP': 'php', 'Python': 'python', 'Ruby': 'ruby'};
	$scope.currentMode = $rootScope.currentMode = $scope.modes.JavaScript;

	$scope.$watch('currentMode', function(){
		$scope.editorOptions.mode = $scope.currentMode;
	});

    //SWITCHING CONTROL OF EDITOR

    $scope.changeEditor = function(name) {
        angular.forEach($scope.data.users, function(user){
            user.hasWritePermission = (user.name === name);
        });
        socket.emit('update-users', $scope.data.users);
    };
    
	//UPDATE TEXTAREA IN REALTIME

	$scope.$watch('data.textarea', function(update){
        if($scope.editorOptions.readOnly === false) {
            socket.emit('CodeMirror', update);
        }
	});

	socket.on('CodeMirror', function(update){
		$scope.$apply(function(){$scope.data.textarea = update});
	});
}]);




















