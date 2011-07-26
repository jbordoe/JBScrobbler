var eventDiv = document.createElement('div');
eventDiv.id = 'scrobblerEventDiv';
document.body.appendChild(eventDiv);



var port = chrome.extension.connect({name: "playStatus"});
document.getElementById('scrobblerEventDiv').addEventListener('changeEvent', function() {
  var eventData = document.getElementById('scrobblerEventDiv').innerText;
  //notify('Player Update!', message, 5000);
  //alert(eventData);
  port.postMessage(eventData);
});

// function notify(title, message, timeout) {
// 	var not = webkitNotifications.createNotification(
// 	  'icon.png', title, message);
// 	  not.show();
// 	  setTimeout(function(){
// 	    not.cancel();
// 	  }, ''+timeout);
// }