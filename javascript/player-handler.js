
/**
 * @constructor
 */
PlayerHandler = function(){
	this.playerInfo = {
		"playState":0,
		"elapsed":0,
		"started":0,
		"url":"",
		"track":{}
	};
}

PlayerHandler.prototype.init = function(){
	
}

// PlayerHandler.prototype.init = function() {
// 	var port = chrome.extension.connect();
// 	document.getElementById('scrobblerEventDiv').addEventListener('changeEvent', function() {
// 	  var eventData = document.getElementById('scrobblerEventDiv').innerText;
// 	  this.playerInfo = JSON.parse(eventData);
// 	  var message = this.playerInfo.playState+", "+this.playerInfo.track.artist+": "+this.playerInfo.track.title;
// 	  notify('Player Update!', message, 5000);
// 	  port.postMessage({message: "changeEvent", values: eventData});
// 	});
// };


PlayerHandler.prototype.scrobble = function() {
	if(this.getDuration() > 30000 && (this.getElapsed() > 240000 || this.getElapsed() > this.getDuration()/2)){
		this.scrobbleRequest(this.getTrackInfo());
	}
}

PlayerHandler.prototype.scrobbleRequest = function(trackInfo) {
	var req = "http://ws.audioscrobbler.com/2.0/?track="+trackInfo.track+"&artist="+trackInfo.artist+"&duration="+trackInfo.length+"\
	&api_key=b670cc567839c6805239185af5031b63&api_sig=foo&sk=foo"
	alert(req);
}




PlayerHandler.prototype.updatePopup = function() {

}