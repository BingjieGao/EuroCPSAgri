module.exports = (function(){
	var fs = require('fs');
	var serialport = require('serialport');
	var SerialPort = require('serialport').SerialPort;
	var util = require("util");
	var eventEmitter = require('events').EventEmitter;
	var console = { log: require("debug")("DHTDriver") }

	var crc_checksum = require("./crc.js");

	function dht(){
		eventEmitter.call(this);

		this._serialport = null;
		this._feedId = "v01";
		this._testId = 0;
	    this.timestamp = 0;
	}
	util.inherits(dht, eventEmitter);

	dht.prototype.start = function(command,TestId/*optional*/){
	    var self = this;
	    this._serialport = new SerialPort("COM3", {
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
	    		
	    		handleData.call(self,command,TestId,data_array);
	    	}
	        
	    });
	    this._serialport.on('error', function(err) {
	        console.log(err);
	    });

	    runCommand.call(this,command,TestId);
	}

	var runCommand = function(command,TestId){
		//var self = this;
		switch (command){
			case 1:
				ReadAll.call(this);
				break;
			case 2:
				TestOne.call(this,TestId);
				break;

		}
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
		console.log("sending test id "+self._testId);
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

	var handleData = function(command,TestId,data_array){
		switch(command){
			case 1:
				handleReceivedData.call(this,data_array);
				break;
			case 2:
				handleTestData(TestId,data_array);
				break;

		}
	}
	var handleReceivedData = function(data_array){
		var self = this;
	    var input = new Buffer(data_array.slice(1,166));
	    crc_checksum.crc16(input,0x0000,function(data){
	        var o = new Buffer([data >> 8, data & 0xFF]);
	        console.log("checksum hex is "+o.toString('hex'));
	        if((o.toString('hex') == data_array[data_array.length-2]) && (data_array[data_array.length-3] == '165')){
	            console.log("checksum is correct");
	            handleJsonData.call(self,data_array);
	        }
	        else
	            console.log("ERROR CHECK ON CHECLSUM, CORROPTED DATA");
	    }) 
	    
	}

	var handleJsonData = function(data_array){
		
		var Temp_data = [];
		var Hum_data = [];

		data_array = data_array.slice(1,166);
		// get current date
    var date = Date.now();

		for(var i =0;i<24;i++){
			var one_TempData = {
			  timestamp:date,
				sensorId: i+1,
				Temp: (parseInt(data_array[i*5+2])*256+parseInt(data_array[i*5+3]))/10
			};
			var one_HumData = {
			  timestamp:date,
				sensorId:i+1,
				Hum: (parseInt(data_array[i*5])*256 + parseInt(data_array[i*5+1]))/10
			}
			Temp_data.push(one_TempData);
			Hum_data.push(one_HumData);
		}

		if((Temp_data!=null) && (Hum_data!=null)){
			this.emit('datum',Temp_data,Hum_data);
		};
	}

	function handleTestData(TestId,data_array){
		var input = new Buffer(data_array.slice(2,7));
		var crc16 = crc_checksum.crc16(input,0x0000,function(data){
	        var o = new Buffer([data >> 8, data & 0xFF]);
	        console.log("checksum hex is "+o.toString('hex'));
	        if((o.toString('hex') == data_array[data_array.length-2]) && (data_array[data_array.length-3] == '5') && parseInt(data_array[1]) == TestId){
	            console.log("checksum is correct");
	            console.log("testid is "+TestId);
	            console.log("Humidity is " +(parseInt(data_array[2])*256+parseInt(data_array[3]))/10+"%");
	            console.log("0ture is "+((parseInt(data_array[4])*256+parseInt(data_array[5]))/10+"°C"));
	        }
	        else
	            console.log("ERROR CHECK ON CHECLSUM, CORROPTEDDATA");
	    })
	}
	return dht;
}());

