this.playerInfo = {
	"playState":0,
	"elapsed":0,
	"started":0,
	"url":"",
	"track":{}
};

	setInterval(function(){
		this.checkStatus(); //listen for key changes in player status
	},100);


var eventDiv = document.createElement('div');
eventDiv.id = 'scrobblerEventDiv';
document.body.appendChild(eventDiv);

var changeEvent = document.createEvent('Event');
customEvent.initEvent('changeEvent', true, true);

function fireCustomEvent(data) {
  eventDiv = document.getElementById('scrobblerEventDiv');
  eventDiv.innerText = JSON.stringify(data);
  eventDiv.dispatchEvent(changeEvent);
}