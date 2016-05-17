angular.module('Collaboratr', ['firebase', 'ui.codemirror'])
.controller('CollabCtrl', ['$rootScope', '$scope', '$firebaseObject', function($rootScope, $scope, $firebaseObject){
	var ref = new Firebase("https://collaboratr.firebaseio.com/data");

	$scope.data = $firebaseObject(ref);

	$scope.data.$bindTo($scope, "data").then(function(){
		ref.set({users: ['alex', 'rico', 'jean-jaques'],
				 textarea: ''});
	});
	
	$scope.modes = {'HTML': 'htmlmixed', 'CSS': 'css', 'JavaScript': 'javascript', 'PHP': 'php', 'Python': 'python', 'Ruby': 'ruby'};
	$scope.currentMode = $rootScope.currentMode = $scope.modes.JavaScript;
	$scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        mode: $rootScope.currentMode
    };
	
	$scope.$watch('currentMode', function(value){
		$rootScope.currentMode = value;
		$scope.editorOptions.mode = $rootScope.currentMode;
	}); 

}]);