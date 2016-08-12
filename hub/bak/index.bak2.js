
var fs = require('fs');
var serialport = require('serialport');
var SerialPort = require('serialport').SerialPort;

var crc_checksum = require("./crc.js");

function dht(){
	this._feedId = "v01";
	this._testId = 0;
    this.timestamp = 0;
}
dht.prototype.testOne = function(sensorID){

}
dht.prototype.start = function(){
    var self = this;
    this._serialport = new SerialPort("/dev/tty.usbserial-A402Y0Q0", {
	    parser: serialport.parsers.readline('\n\r'),
	    baudrate: 9600,
  	    dataBits: 8,
  	    parity: 'none',
  	    stopBits: 1
    });

    var array = [];
    this._serialport.on('data', function(data) {
        console.log(data.toString());
        var received_data = data.toString();
        var data_array = received_data.split(',');;
        if(!((data_array[0] == 'aa55') && (data_array[data_array.length-1] == 'aa55'))){
        	console.log("NOT GETTING START/END BYTES");
    	}
    	else{
    		handleTestData(self._testId,data_array);	
    	}
        
    });
    this._serialport.on('error', function(err) {
        console.log(err);
    });
    TestOne.call(this,32);
}
var ReadAll = function(){
	var self = this;
	console.log("hub sending cmd 1");
	self._serialport.on('open', function (){
		self._serialport.write('1');
		self._serialport.write('\n');
	});
}


var TestOne = function(TestId){
	var self = this;
	console.log("hub sending cmd 2");
	var unit = TestId%10;
	var dec = (TestId - unit)/10;
	unit = unit+'';
	dec = dec+'';
	self._testId = parseInt(TestId);
	console.log("sending test id "+this._testId);
	self._serialport.on('open',function(){

		self._serialport.write('2');
		self._serialport.write('+');
		self._serialport.write(dec);
		self._serialport.write(unit);
		self._serialport.write('\n');
	});

}


var stopRead = function(){
	this._serialport.write("\n");
}


function handleReceivedData(data_array){

    var input = new Buffer(data_array.slice(1,166));
    crc_checksum.crc16(input,0x0000,function(data){
        var o = new Buffer([data >> 8, data & 0xFF]);
        console.log("checksum hex is "+o.toString('hex'));
        if((o.toString('hex') == data_array[data_array.length-2]) && (data_array[data_array.length-3] == '165')){
            console.log("checksum is correct");
            handleJsonData(data_array);
        }
        else
            console.log("ERROR CHECK ON CHECLSUM, CORROPTEDDATA");
    }) 
    
}

function handleJsonData(data_array){
	var sensor_data = [];
	data_array = data_array.slice(1,166);
	for(var i =0;i<33;i++){
		var one_sensor = {
			sensorId: i+1,
			Temp: (parseInt(data_array[i*5])*256+parseInt(data_array[i*5+1]))/10,
			Hum: (parseInt(data_array[i*5+2])*256+parseInt(data_array[i*5+3]))/10,
		};
		sensor_data.push(one_sensor);
	}
	var emit_data = {
		timestamp:Date.now(),
		sensor_data:sensor_data
	}
	console.log(emit_data);
	// this.emit("data",this.feedId,{
	// 	timestamp:Date.now(),
	// 	sensor_data: sensor_data
	// })
}

function handleTestData(TestId,data_array){
	var input = new Buffer(data_array.slice(2,7));
	var crc16 = crc_checksum.crc16(input,0x0000,function(data){
        var o = new Buffer([data >> 8, data & 0xFF]);
        console.log("checksum hex is "+o.toString('hex'));
        if((o.toString('hex') == data_array[data_array.length-2]) && (data_array[data_array.length-3] == '5') && parseInt(data_array[1]) == TestId){
            console.log("checksum is correct");
            console.log("testid is "+TestId);
        }
        else
            console.log("ERROR CHECK ON CHECLSUM, CORROPTEDDATA");
    })
}

var dhtdriver = new dht;
dhtdriver.start();


