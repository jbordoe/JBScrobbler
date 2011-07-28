/**
 * initialises appropriate media player listener on a page, then listens for updates in its status and sends this data
 *  to the background page
 * @author jesse.bordoe@google.com (Jesse Bordoe)
 */
var players = {
		"YMP": "/javascript/ymp-listener.js"
	};

var eventDiv = document.createElement('div');
eventDiv.id = 'scrobblerEventDiv';
document.body.appendChild(eventDiv);

var scriptArr = document.getElementsByTagName('script');
for (tag in document.getElementsByTagName('script')) {
	// check if YMP is being used, if so, inject the listener code 
	if(scriptArr[tag].src == "http://mediaplayer.yahoo.com/js") {
		var script = document.createElement('script');
		script.setAttribute("type", "application/javascript");
  	script.src = chrome.extension.getURL(players['YMP']);
  	document.body.appendChild(script);
		break;
	}
}
// set up connection to background page
var port = chrome.extension.connect({name: "playStatus"});

// listen for updates from media player listener 
document.getElementById('scrobblerEventDiv').addEventListener('changeEvent', function() {
  var eventData = document.getElementById('scrobblerEventDiv').innerText;
  port.postMessage(eventData);
});

