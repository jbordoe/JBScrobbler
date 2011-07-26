/**
 * @constructor
 */
 YMPListener = function(){
	this.playerStatus = {
		"playState":0, //0 = stopped, 1 = paused, 2 = playing
		"elapsed":0,	//How long the tracks been playing
		"started":0,	//when the track began playing (unix timestamp)
		"url":"",	//url of the MP3 being played
		"track":{		
			"artist":"",
			"title":"",
			"duration":0
		} 	
	}
	this.scrobbled = false;
}

YMPListener.prototype.init = function(){
	this.changeEvent = document.createEvent('Event');
	this.changeEvent.initEvent('changeEvent', true, true);
};

YMPListener.prototype.fireCustomEvent = function(data) {
  eventDiv = document.getElementById('scrobblerEventDiv');
  eventDiv.innerText = JSON.stringify(data);
  eventDiv.dispatchEvent(this.changeEvent);
}

YMPListener.prototype.getTrackInfo = function() {
	var artist = document.getElementById('ymp-meta-artist-title').innerHTML;
	var track;
	var duration = this.getDuration();
	if (!artist) {
		var arr = document.getElementById('ymp-meta-track-title').innerHTML.split(":",2);
		artist = arr[0];
		track = arr[1].replace('"','').replace(/"$/,'');		
	} else {
		track = document.getElementById('ymp-meta-track-title').innerHTML;
	}
	return {
		"artist":artist,
		"title":track,
		"duration":duration		
	};
}

YMPListener.prototype.getPlayerStatus = function(){
	var currentStatus = {};
	currentStatus.playState = this.getPlayState();
	currentStatus.elapsed = this.playerStatus.elapsed;
	currentStatus.url = this.getURL();
	currentStatus.started = new Date().getTime();
	currentStatus.track = this.getTrackInfo();
	return currentStatus;
}

YMPListener.prototype.getElapsed = function() {
	return YAHOO.mediaplayer.Controller.mediaengine.getElapsed();
}

YMPListener.prototype.getDuration = function() {
	return YAHOO.mediaplayer.Controller.mediaengine.getDuration();
}

YMPListener.prototype.getURL = function() {
	return YAHOO.mediaplayer.Controller.mediaengine.currentEngine.currentMedia.url;
}

YMPListener.prototype.getPlayState = function() {
	return YAHOO.mediaplayer.Controller.mediaengine.currentPlayState;
}

YMPListener.prototype.update = function() {
	this.playerStatus = this.getPlayerStatus();
}

YMPListener.prototype.updateTrack = function() {
	this.playerStatus.track = this.getTrackInfo();
}

/**
 * listens for key changes in player status (change in track, playstatus, elpased time etc...)
 */
YMPListener.prototype.checkStatus = function() {
	if(!this.scrobbled){
		if(this.playerStatus.playState == 2){ //currently playing, increment elapsed playtime
			this.playerStatus.elapsed = this.playerStatus.elapsed + interval;
			if(this.playerStatus.track.duration < 1){
				this.playerStatus.track.duration = this.getDuration();
			}

		}		
		//scrobble when we're halfway thru track or 4 minutes into it, whichever comes sooner
		if(this.playerStatus.track.duration > 30000 && (this.playerStatus.elapsed > this.playerStatus.track.duration/2 || this.playerStatus.elapsed > 240000)){
			this.scrobbled = true;
			this.fireCustomEvent(this.playerStatus);
		}	else if (this.playerStatus.url != this.getURL()) {
			this.scrobbled = false;
			this.update();
			this.playerStatus.elapsed = 0;
			this.fireCustomEvent(this.playerStatus);
		} else if (this.playerStatus.playState != this.getPlayState()) {
			this.playerStatus.playState = this.getPlayState();
			this.fireCustomEvent(this.playerStatus);
		}	
	}
}

//main
/** how frequently the player status is checked, in milliseconds */
var interval = 500; 


if(!ympListener){
	var ympListener = new YMPListener();
	ympListener.init();
	setInterval(function(){
		ympListener.checkStatus(); //listen for key changes in player status
},interval);
}	
