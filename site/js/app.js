angular.module('Collaboratr', [])
.factory('CollabFactory', function(){

});

$(function(){
	var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
		path: "../codemirror-5.14.2/lib/codemirror.js",
 		lineNumbers: true,
  		gutters: ["CodeMirror-linenumbers", "breakpoints"],
  		value: document.getElementById('editor').value,
  		mode:  "javascript",
  		smartIndent: true
	});
});
