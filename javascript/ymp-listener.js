/**
 * @author jesse.bordoe@google.com (Jesse Bordoe)
 */

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
			"duration":0,
			"scrobbleTime":240000 //default time to scrobble is 4 minutes
		} 	
	}
	this.scrobbled = false;
}

YMPListener.prototype.init = function(){
	this.changeEvent = document.createEvent('Event');
	this.changeEvent.initEvent('changeEvent', true, true);
};

/**
 * updates event div with data so content script can read it and pass it to background page
 * @param data the data to send
 */
YMPListener.prototype.fireCustomEvent = function(data) {
  eventDiv = document.getElementById('scrobblerEventDiv');
  eventDiv.style = ('display: none;');
  eventDiv.innerText = JSON.stringify(data);
  eventDiv.dispatchEvent(this.changeEvent);
}

YMPListener.prototype.getTrackInfo = function() {
	var artist = document.getElementById('ymp-meta-artist-title').innerHTML;
	var track;
	var duration = this.getDuration();
	if (!artist) {
		var str = document.getElementById('ymp-meta-track-title').innerHTML;
		var arr = this.extractTrackDetails(str);
		artist = arr[0];
		track = arr[1];
	} else {
		track = document.getElementById('ymp-meta-track-title').innerHTML;
	}
	return {
		"artist":artist,
		"title":track,
		"duration":duration,
		"scrobbleTime":240000 //default time to scrobble is 4 minutes		
	};
}

YMPListener.prototype.getPlayerStatus = function(){
	var currentStatus = {};
	currentStatus.playState = this.getPlayState();
	currentStatus.elapsed = this.playerStatus.elapsed;
	currentStatus.url = this.getURL();
	currentStatus.started = Math.round(new Date().getTime() / 1000); //unix timestamp
	currentStatus.track = this.getTrackInfo();
	return currentStatus;
}

YMPListener.prototype.getElapsed = function() {
	try {
		return YAHOO.mediaplayer.Controller.mediaengine.getElapsed();
	} catch(err) {
		return 0;
	}
}

YMPListener.prototype.getDuration = function() {
	try {
		return YAHOO.mediaplayer.Controller.mediaengine.getDuration();
	} catch(err) {
		return 0;
	}
}

YMPListener.prototype.getURL = function() {
	try {
		return YAHOO.mediaplayer.Controller.mediaengine.currentEngine.currentMedia.url;
	} catch(err) {
		return "";
	}
}

YMPListener.prototype.getPlayState = function() {
	try {
		return YAHOO.mediaplayer.Controller.mediaengine.currentPlayState;
	} catch(err) {
		return 0;
	}
}

YMPListener.prototype.update = function() {
	this.playerStatus = this.getPlayerStatus();
}

/**
 * given a track title and artist in one string, try and extract them using common patterns
 */
YMPListener.prototype.extractTrackDetails = function(string) {
	var arr = new Array();
	if (string.match(/.*?:\s*"[^"]+/)) {
		arr =  string.split(':',2);
		arr[1] = arr[1].replace(/"([^2]+)"/,'$1');
		alert(arr[1]);
	} else if (string.match(/.*::.*/)) {
		arr = string.split('::',2); 
	}
	if (arr.length == 2) {
		arr[0] = trim(arr[0]);
		arr[1] = trim(arr[1]);
	}
	return arr;
}

YMPListener.prototype.updateTrack = function() {
	this.playerStatus.track = this.getTrackInfo();
}

/**
 * listens for and updates key changes in player status (change in track, playstatus, elpased time etc...)
 */
YMPListener.prototype.checkStatus = function() {
	/** flag whether we need to send updated status to background page */
	var updated = false; 
	if(!this.scrobbled){
		if(this.playerStatus.playState == 2){ //currently playing, increment elapsed playtime
			this.playerStatus.elapsed = this.playerStatus.elapsed + interval;
		}		
		//duration wil be < 1ms until track is fully loaded, so keep checking until this occurs, then update duration
		if(this.playerStatus.track.duration < 1 && this.getDuration() > 30000){ //ignore tracks below 30s, these aren't scrobbled
			this.playerStatus.track.duration = this.getDuration();
			//once we have duration, set scrobble point to half that time or keep at 4 minutes, whichever is shorter
			if(this.playerStatus.track.duration < 480000 ){
				this.playerStatus.track.scrobbleTime = this.playerStatus.track.duration/2;
			}
			updated = true;
		}
		//send data to background when we reach the alotted scrobble time
		if(this.playerStatus.elapsed > this.playerStatus.scrobbleTime){
			this.scrobbled = true;
			updated = true;
		}	else if (this.playerStatus.url != this.getURL()) { //change in track being played - reset status
			this.scrobbled = false;
			this.update();
			this.playerStatus.elapsed = 0;
			updated = true;
		} else if (this.playerStatus.playState != this.getPlayState()) { //update playstate
			this.playerStatus.playState = this.getPlayState();
			updated = true;
		}	
		// send data to background page if changes have been made to player status
		if(updated){
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

function trim(str){
	return str.replace(/^\s+|\s+$/g, '');
}