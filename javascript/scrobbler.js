var apiURL = "http://ws.audioscrobbler.com/2.0/?";
var apiKey = "b670cc567839c6805239185af5031b63";

/**
 * Retrieves a token and opens a new window for user to authorize it
 */
function authorize() {
   var httpRequest = new XMLHttpRequest();  
   var params = {
      "method":"auth.gettoken",
      "api_key": apiKey,
      "format": "json"
   };
   httpRequest.open("GET", apiURL + toQueryString(params), false); 
   httpRequest.setRequestHeader("Content-Type", "application/xml");
   httpRequest.send(null);    
   console.log('getToken response: %s', httpRequest.responseText);
   var response = JSON.parse(httpRequest.responseText);
   if (!response.token) {
      console.log('Error acquiring a token: %s', httpRequest.responseText);
      localStorage.token = '';
   } else {
      localStorage.token = response.token;
      //tab for token authorization
      var url = 'http://www.last.fm/api/auth/?api_key=' + apiKey + '&token=' + localStorage.token;
      window.open(url);
   }            
}



function getSessionKey() {
   // make sure a token exists beforehand, 
   if (!localStorage.token || localStorage.token == '') {
      authorize();
      return false;
   }
   // check for existing session
   if (localStorage.sessionKey && localStorage.sessionKey != '') {
      return localStorage.sessionKey;
   }
   var params = {
      "method":"auth.getsession",
      "api_key" : apiKey,
      "token" : localStorage.token,
      "format": "json"
   }
   var apiSig = getAPISignature(params);
   var url = apiURL + toQueryString(params) + '&api_sig=' + apiSig;

   var httpRequest = new XMLHttpRequest();
   httpRequest.open("GET", url, false); 
   httpRequest.setRequestHeader("Content-Type", "application/xml");
   httpRequest.send(null); 
        
   console.log('getSession reponse: %s', httpRequest.responseText);
   var response = JSON.parse(httpRequest.responseText);

   if (response.error) {
      console.log('getSession - error: ' + response.message);
      localStorage.sessionKey = '';
      authorize();
   } else {
      localStorage.sessionKey = response.session.key;
      return localStorage.sessionKey;
   }   
   return false;
}

/**
 * inform last.fm of the song which is currently being played
 */
function updateNowPlaying() {
   var sessionKey = getSessionKey();

   var params = {
      "method":"track.updatenowplaying",
      "artist": playerStatus.track.artist,
      "track": playerStatus.track.title,
      "api_key": apiKey,
      "sk": sessionKey,
      "format": "json"
   };
   var apiSig = getAPISignature(params);
   var url = apiURL + toQueryString(params) + '&api_sig=' + apiSig;

   var httpRequest = new XMLHttpRequest();  
   httpRequest.open("POST", url, false); 
   httpRequest.setRequestHeader("Content-Type", "application/xml");
   httpRequest.send(null);    
   console.log('updateNowPlaying reponse: %s', httpRequest.responseText);

   var response = JSON.parse(httpRequest.responseText);
   if(response.error){
      console.log('updateNowPlaying - error: %s', response.message);
   } else {
      notify('Now playing',playerStatus.track.artist+' "'+playerStatus.track.title+'"',5000);
   }   
}

/**
 * submit song to last.fm db
 */
function scrobble() {
   var sessionKey = getSessionKey();

   var params = {
      "method":"track.scrobble",
      "artist": playerStatus.track.artist,
      "timestamp": playerStatus.started,
      "track": playerStatus.track.title,
      "api_key": apiKey,
      "sk": sessionKey,
      "format": "json"
   };
   var apiSig = getAPISignature(params);
   var url = apiURL + toQueryString(params) + '&api_sig=' + apiSig;

   var httpRequest = new XMLHttpRequest();  
   httpRequest.open("POST", url, false); 
   httpRequest.setRequestHeader("Content-Type", "application/xml");
   httpRequest.send(null);    
   console.log('scrobble reponse: %s', httpRequest.responseText);

   var response = JSON.parse(httpRequest.responseText);
   if(response.error){
      console.log('scrobble - error: %s', response.message);
   } else {
      notify('Scrobbled!',playerStatus.track.artist+' "'+playerStatus.track.title+'"',5000);
   }   
}

/**
 * Creates query string from associative array
 */
function toQueryString(params) {
   var arr = new Array();
   for (var p in params) {
      arr.push(p + '=' + encodeURIComponent(params[p]));
   }
   return arr.join('&');
}

/**
 * generate signature for a last.fm API call
 */
function getAPISignature(params) {
   var sig = '';
   var keys = new Array();
   for (var p in params) {
      if (p != 'format' && p != 'callback') {
         keys.push(p);
      }
   }
   keys.sort();

   for (var k in keys) {
      sig = sig + keys[k] + params[keys[k]];
   }
   //append secret and generate MD5 hash
   return MD5(sig + '9bb51afb48aea28f67fb5fdb0a9bde21');
}
