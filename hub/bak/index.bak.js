
var fs = require('fs');
var serialport = require('serialport');
var SerialPort = require('serialport').SerialPort;

var crc_checksum = require("./crc.js");

function dht(){
    this._temp = 0;
    this.hum = 0;
    this.timestamp = 0;
}
dht.prototype.testOne = function(sensorID){

}
    var array = [];
    var port = new SerialPort("/dev/tty.usbserial-A402Y0Q0", {
	        parser: serialport.parsers.readline("\n\r"),
	        baudrate: 9600,
  	        dataBits: 8,
  	        parity: 'none',
  	        stopBits: 1
        });

    port.on('data', function(data) {
        console.log(data.toString());
        var received_data = data.toString();
        var data_array = received_data.split(',');
        console.log(data_array);
        handleReceivedData(received_data);
    });
    port.on('error', function(err) {
        console.log(err);
    });





function handleReceivedData(data){
    var data_array = data.split(',');
    if(!((data_array[0] == 'aa55') && (data_array[data_array.length-1] == 'aa55'))){
        console.log("NOT GETTING START/END BYTES");
    }
    else{
        var input = new Buffer(data_array.slice(1,166));
        crc_checksum.crc16(input,0x0000,function(data){
            var o = new Buffer([data >> 8, data & 0xFF]);
            console.log("checksum hex is "+o.toString('hex'));
            if((o.toString('hex') == data_array[data_array.length-2]) && (data_array[data_array.length-3] == '165')){
                console.log("checksum is correct");
                //handleJsonData(data_array);
            }
            else
                console.log("ERROR CHECK ON CHECLSUM, CORROPTEDDATA");
        }) 
    }
}
 

ReadAll();

// function handleJsonData(data_array){
// 	var sensor_data = [];
// 	for(var i =0;i<data_array.length-)
// 	this.emit("data",this.config.feedId,{
// 		timestamp:Date.now(),
// 		sensor_data:
// 			[
// 				{}
// 			]
// 	})
// }
var TestOne = function(TestId){
	console.log("hub sending cmd 2");
	var unit = TestId%10;
	var dec = (TestId - unit)/10;
	unit = unit+'';
	dec = dec+'';
	port.on('open',function(){

		port.write('2');
		port.write('+');
		port.write(dec);
		port.write(unit);
		port.write('\n');
	});

}
function ReadAll(){
	console.log("hub sending cmd 1");
	port.on('open', function (){
		port.write('1');
		port.write('\n');
	});
}

var stopRead = function(){
	port.write("\n");
}

//TestOne(02);

