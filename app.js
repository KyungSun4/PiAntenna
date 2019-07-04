var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://placer:cs196illinois@ds135966.mlab.com:35966/r-place-game";
var portName = "/dev/tty.usbmodem14201"
SerialPort = require("serialport");

const packagesize = 200
var debug = require('debug')('hello-world:server');
var curBuffer = new Uint8Array(packagesize);

// last empty position in the buffer
var curBufferEndIndex = 0;
function startListener(debug)
{
	serialListener(debug);
	console.log("listener starting");
}

function serialListener(debug)
{
	serialPort = new SerialPort(portName, {
		baudRate: 19200,
		// defaults for Arduino serial communication
			dataBits: 8,
			parity: 'none',
			stopBits: 1,
			flowControl: false
	});

	serialPort.on("open", function () {
	console.log('open serial communication');

		// Listens to incoming data
		serialPort.on('data', function(data) {		//read serial data into variable "data"
			
			// add new data to cur buffer
			for(var i = 0; i < data.length; i++) {
				curBuffer[curBufferEndIndex] = data[i]
				curBufferEndIndex++
				if (curBufferEndIndex == packagesize) {
					MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
						if (err) throw err;
						//restarts whole game incliding database
						let dbo = db.db("r-place-game");
						
						dbo.collection("fsgp").insertOne({millis: Date.now(), data: curBuffer}, function(err, res) {
							if (err) throw err;
							db.close();
						});
					});
					curBufferEndIndex = 0
				}
			}
		});
	});
}                                           			                                                                                                                    				        				                                      		    	                                                                                                                      module.exports.start = startListener;
startListener(debug)