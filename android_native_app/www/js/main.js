var changeURL = function(target) {
  var iframe = document.getElementById('iframe');
  iframe.src = target.value;
}

var toggle = function() {
  var controls = document.getElementById('controls');
  if (controls.style.display === 'none') {
    controls.style.display = 'block';
  } else {
    controls.style.display = 'none';
  }
};
