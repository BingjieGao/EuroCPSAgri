var fs = require("fs");
var path = require("path");
var localDatapath = path.join(__dirname,'./','hum.json')
var dataIn = [];
var util = require('util');
dataIn.push({ "sensorId": 1, "Temp": 51.5 });
dataIn.push({ "sensorId": 2, "Temp": 180 });
var data = {
  timestamp:1488888888888,
  TempData:dataIn
};
var dataObj = {
  feedId:01,
  TempData:data
};

//console.log(dataObj.TempData);

readFileLine(localDatapath,data,function(datum){
  console.log('final result'+JSON.stringify(datum));
  fs.writeFile(localDatapath,JSON.stringify(datum),{ flag : 'w' },function(err){
    if(err)
      console.log(err);
  });
})

function readFileLine(datapath,dataIn,callback){
  console.log('dataIn is => '+JSON.stringify(dataIn));
     var inputfile = fs.createReadStream(datapath);
    fs.open(datapath,'a+',function(err,fd){
      if(err)
        console.log(err)
      else{
        fs.readFile(localDatapath,'utf8',function(err,data){
            console.log('input json is '+JSON.parse(data).TempData);
             var feedId = JSON.parse(data).feedId;
             var TempData = JSON.parse(data).TempData;
             if(util.isArray(TempData)){
                TempData.push(dataIn);
                TempData.push(dataIn);
              }
              else{
                TempData = [];
                TempData.push(JSON.parse(data).TempData);
                TempData.push(dataIn);
              }
             //TempData.push(JSON.parse(data).TempData);
             console.log('new temp data'+TempData);
             var datum = {
              feedId:feedId,
              TempData:TempData
             }
             callback(datum);
        })
      }
    })
}