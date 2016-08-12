
var serialport = require('serialport');
var SerialPort = require('serialport').SerialPort;


var rateport = new SerialPort("/dev/tty.usbmodem1411", {
  parser: serialport.parsers.raw,
  baudrate: 9600,
  dataBits: 7,
  parity: 'even',
  stopBits: 2
});

rateport.on('data',function(data){
  console.log(data.toString('ascii'));
  decode(data,function(){});
})

function decode(dataIn,cb){

}