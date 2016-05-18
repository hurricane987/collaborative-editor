angular.module('Collaboratr', ['firebase', 'ui.codemirror'])
.controller('CollabCtrl', ['$rootScope', '$scope', '$firebaseObject', function($rootScope, $scope, $firebaseObject){
	var ref = new Firebase("https://collaboratr.firebaseio.com/data");

	obj = $firebaseObject(ref);

	obj.$bindTo($scope, "data").then(function(){
		ref.set({textarea: '//your code goes here!'});
	});
	
	$scope.modes = {'HTML': 'htmlmixed', 'CSS': 'css', 'JavaScript': 'javascript', 'PHP': 'php', 'Python': 'python', 'Ruby': 'ruby'};
	$scope.currentMode = $rootScope.currentMode = $scope.modes.JavaScript;
	$scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        mode: $rootScope.currentMode
    };
}]);