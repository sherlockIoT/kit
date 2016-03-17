/*
 * mqtt client
 * sheduler
 * json file
 * audio play api
 * shell script
 * 
 * */

require ('shelljs/global');
var Bleacon = require('bleacon');
var Cloudant = require('cloudant');
var config = require('./cloudant.json');
var gameConfig = require('./game.json');
var omx = require('omx-manager');
var gpio = require('rpi-gpio');

var events = require('events');
var eventEmitter = new events.EventEmitter();

var GAMEID = gameConfig.gameId;

//number to be dialled. Change this value to receive a new number
var NUMBER = 4;

//setup the pins for reading the receiver and the rotary dial
gpio.setup(18, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.setup(12, gpio.DIR_IN, gpio.EDGE_BOTH); 
gpio.setup(16, gpio.DIR_IN, gpio.EDGE_BOTH);

var rrpCloudantDB;

var store = [];

var numOfSteps = 0;
var step = 0;

var ringing = false;
var userDialledFlag = false;

function initialize (cb) {

	console.log("initialize called");

	var cloudantConfig = config.cloudantConfig;
	
	var cloudant = Cloudant({account:cloudantConfig.user, password:cloudantConfig.password});

	rrpCloudantDB = cloudant.db.use(cloudantConfig.dbName);

	rrpCloudantDB.find({selector:{gameId:GAMEID}}, function(er, result) {
		  if (er) {
		    throw er;
		  }

		  console.log('Found %d documents with gameId %s', result.docs.length, GAMEID);  

		  store = result.docs;
		  numOfSteps = result.docs.length;

		  for( var i =0 ; i<numOfSteps ; i++) {
		  	var clue = store[i];
		  	espeak_tts_conversion(clue.message, "./audio_files/"+i+".wav");
		  }
		  cb();
	});
}

var gameplay = function () {
	

	if(step < numOfSteps) {

		console.log("Clue number : "+step +" / "+numOfSteps);

		/*
		Clue contains : 
		stepId, triggerMechanism, triggerId, status, and message
		*/
		var clue = store[step];

		console.log(clue);

		switch (clue.triggerMechanism) {
			case 'beacon' : 
						console.log("Came in Beacon");
						Bleacon.startScanning(clue.triggerId[0], clue.triggerId[1] , clue.triggerId[2]);
						Bleacon.on('discover', function(bleacon) {
							console.log(bleacon.proximity)

							if(bleacon.proximity === "immediate") {

								console.log("Beacon Play file");

								eventEmitter.emit("ring"); // emit ring event
							}
						});
						break;

			case 'time'  :
						console.log('time : '+clue.triggerId);
						setTimeout(function(stepNum) {
							console.log("Time Play file");

							eventEmitter.emit("ring"); // emit ring event

						},clue.triggerId*1000*60, step);

						break;

			case 'userDial' :
						console.log("USerdialled");
						userDialledFlag = true;
						break;


			default : 
						console.log("Should not come here");
						break;

		}
	}

}
var read = false;
var count =0;

gpio.on('change', function(channel, value) {

	//18 is the listen off the hook
	if(channel === 18) {

		if(value === false && ringing) {

			eventEmitter.emit("playClue"); // emit ring event
		}
	}

	else if(channel === 16) {
		if(value === true)
			read = true;
		else if(value === false) {
			read = false;
			console.log("The number is :"+count);
			if(count === NUMBER && userDialledFlag) {
				eventEmitter.emit("playClue"); // emit ring event
				count = 0;
			}
			count = 0;
		}
	}	   
	else if(channel === 12){
		if(read && value === false)
			count++;
	}
	console.log('Channel ' + channel + ' value is now ' + value);
});


eventEmitter
	.on("ring", function (argument) {
		console.log("Ring!!!!");
		omx.play('./audio_files/ring.mp3');
		ringing = true;
	})
	.on("playClue", function (argument) {
		omx.stop();
		console.log("Clue play!!!!");
		console.log('./audio_files/'+step+'.wav');
		omx.play('./audio_files/'+step+'.wav');
		step ++;
		ringing = false;
		gameplay();
	});


/*
* This is the function that changes the text to speech.
* Can be changed to different Text to speech engine. Just change the implementation
*/

function espeak_tts_conversion(text_to_play,file_name){
	exec_cmd_conv='espeak -v en-us+f4 -g 8ms -s 170 -k 5 -a 200 -w '+ file_name + ' \"'+ text_to_play + '\" > /dev/null 2>&1 &';

	var espeak_process = exec( exec_cmd_conv, function(err, stdout, stderr) {
    		if (err) 
    			throw err;

    		console.log("Completed for "+file_name);
	});
}

initialize(gameplay);