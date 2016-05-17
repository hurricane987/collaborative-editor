angular.module('Collaboratr', ['firebase'])
.service('CollabService', ['$rootScope', function($rootScope){	
	$rootScope.currentMode;
	return {
		newEditor: function() {
			$rootScope.editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
				lineNumbers: true,
				mode: $rootScope.currentMode
			});
			$rootScope.editor.setOption("mode", $rootScope.currentMode);
		}
	}	
}])
.controller('CollabCtrl', ['$rootScope', '$scope', 'CollabService', '$firebaseObject', function($rootScope, $scope, CollabService, $firebaseObject){
	var ref = new Firebase("https://collaboratr.firebaseio.com/data");

	// $scope.data = $firebaseObject(ref);

	// $scope.data.$bindTo($scope, "data").then(function(){
	// 	console.log($scope.data.textarea);
	// 	console.log($scope.data.users);
	// });
	$scope.data = {
					'users': 'alex',
					'textarea': '//your code goes here!'
				};
	$scope.modes = {'HTML': 'htmlmixed', 'CSS': 'css', 'JavaScript': 'javascript', 'PHP': 'php', 'Python': 'python', 'Ruby': 'ruby'};
	$scope.currentMode = $rootScope.currentMode = $scope.modes.JavaScript;
	$scope.editor = CollabService.newEditor();
	$scope.$watch('currentMode', function(value){
		$rootScope.currentMode = value;
		$rootScope.editor.setOption("mode", $rootScope.currentMode);
	}); 
	console.log($scope.data.textarea);
}]);