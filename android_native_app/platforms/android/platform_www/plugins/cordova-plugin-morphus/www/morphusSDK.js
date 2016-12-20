cordova.define("cordova-plugin-morphus.morphusSDK", function(require, exports, module) {
var exec = require('cordova/exec');

navigator.echo = function(str) {
  cordova.exec(
    function(msg) {
      alert(msg);
    }, 
    function(err) {
      alert(err);
    }, 
    "morphusSDK", 
    "echo", 
    [str]);
};

navigator.is3DModeSupported = function() {
  cordova.exec(
    function(msg) {
      console.log(msg);
      var event = new CustomEvent('Support3DMode', {'detail': true});
      //window.dispatchEvent(event);
      document.getElementById('myiframe').contentWindow.window.dispatchEvent(event)
    }, 
    function(err) {
      console.log("Don't support 3d mode!");
      var event = new CustomEvent('Support3DMode', {'detail': false});
      //window.dispatchEvent(event);
      document.getElementById('myiframe').contentWindow.window.dispatchEvent(event)
    }, 
    "morphusSDK",
    "is3DModeSupported",
    []);
};

/*
example: navigator.set3DModeParallel(3, function(msg){alert(msg);});
*/
navigator.set3DModeParallel = function(mode) {
  cordova.exec(
    function(msg) {
      console.log(msg);
    }, 
    function(err) {
      console.log("Don't support 3d mode!");
    }, 
    "morphusSDK",
    "set3DModeParallel",
    [mode]);
};

navigator.set3DModeSideBySide = function(mode) {
  cordova.exec(
    function(msg) {
      console.log(msg);
    }, 
    function(err) {
      alert("not support");
      console.log("Don't support 3d mode!");
    }, 
    "morphusSDK",
    "set3DModeSideBySide",
    [mode]);
};

});
