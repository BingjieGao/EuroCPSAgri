
var serialport = require('serialport');
var SerialPort = require('serialport').SerialPort;
var path = require('path');
var __dirname = './';
var ratedatapath = path.join(__dirname,"control.json");
var fs = require('fs');
var util = require('util');

var rateport = new SerialPort("/dev/tty.SLAB_USBtoUART", {
  parser: serialport.parsers.readline('\r'),
  baudrate: 9600,
  dataBits: 7,
  parity: 'even',
  stopBits: 2
});

rateport.on('data',function(data){
  console.log(data.toString('ascii'));
  decode(data,function(err,ans){
    if(err)
    console.log(err);
    else
    console.log(ans);
  });
})

function decode(dataIn,cb){
  var dataIn_array = dataIn.split(',');
  console.log(dataIn_array);
  var rateData = {
    "timestamp": Date.now(),
    "ActHotAir": dataIn_array[7],
    "ActDischage": dataIn_array[8],
    "ActExhaust": dataIn_array[9],
    "HotAir": dataIn_array[10],
    "Discharge": dataIn_array[12],
    "Exhaust": dataIn_array[13]
  }
  console.log(rateData);
  fs.open(ratedatapath,'a+',function(err,fd){
    if(err)
      console.log(err);
    else{
      fs.readFile(ratedatapath,'utf8',function(err,data){
        if(data == null || data == ""){
          console.log('empty');
          datum = {
            data: rateData
          };
          console.log('datum is => '+datum);
        }
        else{
          var values = JSON.parse(data).data;
          //console.log('original value is=> '+values);
          if(util.isArray(values)){
            values.push(rateData);
          }
          else{
            values = [];
            values.push(JSON.parse(data).data);
            values.push(rateData);
          }
          datum = {
            data:values
          };
        }
        fs.writeFile(ratedatapath,JSON.stringify(datum),{ flag : 'w' },function(err){
          if(err) {
            console.log(err);
            cb(err,null)
          }
          else {
            cb(null, 'SUCCESS');
            fs.close(fd);
          }
        });
      });
    }
  });

  //var dischargerate = dataIn_array[12];
  //cb(dischargerate);
}