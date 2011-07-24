
/**
 * @constructor
 */
JScrobbler = function(){
	var currentTrack = {};
	var playerInfo = {
		"playState":0,
		"timePlayed":0,
		"started":0,
		"url":"",
		"track":{}
	};
}

JScrobbler.prototype.init = function() {
	var scrobbleButton = document.createElement('img');
	scrobbleButton.src = chrome.extension.getURL('/scrobble-button.png');
	scrobbleButton.id = 'chrome-scrobble-button';
	scrobbleButton.title = 'Scrobble this track now!';
	scrobbleButton.onmouseover = function(){
		document.getElementById('chrome-scrobble-button').src = chrome.extension.getURL('/scrobble-button-b.png');
	};
	scrobbleButton.onmouseout = function(){
		document.getElementById('chrome-scrobble-button').src = chrome.extension.getURL('/scrobble-button.png');
	};
	scrobbleButton.onclick = function(){
		jScrobbler.scrobble();
	};

	setTimeout(function(){
		document.getElementById('ymp-btn-target').parentElement.appendChild(scrobbleButton);
		setInterval(function(){

		},100);
	},5000);


};

JScrobbler.prototype.scrobble = function() {
	//if(this.getDuration() > 30000 && (this.getElapsed() > 240000 || this.getElapsed() > this.getDuration()/2)){
		this.scrobbleRequest(this.getTrackInfo());
	//}
}

JScrobbler.prototype.scrobbleRequest = function(trackInfo) {
	var req = "http://ws.audioscrobbler.com/2.0/?track="+trackInfo.track+"&artist="+trackInfo.artist+"&duration="+trackInfo.length+"\
	&api_key=b670cc567839c6805239185af5031b63&api_sig=foo&sk=foo"
	alert(req);
}

JScrobbler.prototype.getTrackInfo = function() {
	var artist = document.getElementById('ymp-meta-artist-title').innerHTML;
	var track;
	var length = this.getDuration()/1000;
	if (!artist) {
		var arr = document.getElementById('ymp-meta-track-title').innerHTML.split(":",2);
		artist = arr[0];
		track = arr[1].replace('"','').replace(/"$/,'');		
	} else {
		track = document.getElementById('ymp-meta-track-title').innerHTML;
	}
	return {"artist":artist,"track":track,"length":length};
}

JScrobbler.prototype.getElapsed = function() {
	return YAHOO.mediaplayer.Controller.mediaengine.getElapsed();
}

JScrobbler.prototype.getDuration = function() {
	return YAHOO.mediaplayer.Controller.mediaengine.getDuration();
}

JScrobbler.prototype.getURL = function() {
	return YAHOO.mediaplayer.Controller.mediaengine.currentEngine.currentMedia.url;
}

JScrobbler.prototype.checkTrack = function() {
	if (playerInfo.url != this.getURL()){
		
	}
}


//YAHOO.mediaplayer.Controller.mediaengine.currentPlayState

//main
var jScrobbler = new JScrobbler();
jScrobbler.init();