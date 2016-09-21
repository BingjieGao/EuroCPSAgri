var dht = require('./driver.js');
var dhtDriver = new dht();
var console = { log: require("debug")("Index") };
var config = require("./config.js");
var bodyParser = require('body-parser');
var fs = require('fs');
var util = require('util');
var http = require('https');
var request = require('sync-request');
var url = require('url');
var __dirname = './';
var path = require('path');

var PORT = 3125;
var url_path = '127.0.0.1';
var datapath = path.join(__dirname,"moisture.json");
var datapath2 = path.join(__dirname,"graintype.json");
var datapath3 = path.join(__dirname,"discharge.json");

var express = require('express');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


/*
* read JSON data file
*/
var tempDatapath = path.join(__dirname,"temp.json");
var humDatapath = path.join(__dirname,"hum.json");
/*************************************************************************************/
app.set('views', __dirname+'views');
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));


/*
read from config file
 */
var cacheLib = require("nqm-iot-file-cache");
var cache = new cacheLib.FileCache(config.getLocal("cacheConfig",{}));
var moistureId = config.getLocal("moistureId");
var rateId = config.getLocal("rateId");
var graintypeId = config.getLocal("typeId");
var HumId = config.getLocal("HumId");
var TempId = config.getLocal("TempId");

var syncConfig = config.getLocal("syncConfig",{ syncType: "nqm-iot-http-sync" });
var syncLib = require(syncConfig.syncType);
var sync = new syncLib.Sync(syncConfig);
sync.initialise(function(err, reconnect) {
  if (!err) {
    cache.setSyncHandler(sync);
  } else {
    console.log("failed to initialise sync: " + err.message);
  }
});

/*
* main page should show all the sensor readings
* in horizontal bar chart with a timeline bar
*/
app.get('/',function(req,res){
	var TempData = fs.readFileSync(tempDatapath, 'utf8');
	console.log("read file is  "+JSON.parse(TempData).TempData);
	res.render('index',{TempDatum:JSON.stringify(JSON.parse(TempData).TempData),HumDatum:JSON.stringify(HumData.HumData)});
	res.send(JSON.stringify(JSON.parse(TempData).TempData));
})
/********************************************************************/

app.get('/timeseries',function(req,res){

  // /*
  // read from local*/
  
  // var TempData = fs.readFileSync(tempDatapath, 'utf8');
  // var HumData = fs.readFileSync(humDatapath,'utf8');

  // res.render("timeseries",{
  //   TempDatum:JSON.stringify(JSON.parse(TempData).data),
  //   HumDatum:JSON.stringify(JSON.parse(HumData).data)
  // });

  var Tempurl = 'https://q.nqminds.com/v1/datasets/Sylsda0Un/data?opts={"sort":{"timestamp":-1,"sensorId":1},"limit":40000}';
  var EMCurl = 'https://q.nqminds.com/v1/datasets/BklEbvkv2/data?opts={"sort":{"timestamp":-1,"sensorId":1},"limit":40000}';
  var CFGurl = "https://q.nqminds.com/v1/datasets/SJe5yltRn/data";
  RetriveData(Tempurl,function(err,TempData){
    if(!err){
      RetriveData(EMCurl,function(err,EMCData){
        if(!err){
          RetriveData(CFGurl,function(err,CFGData){
             res.render("timeseries",{
              TempDatum:JSON.stringify(TempData.data),
              EMCDatum:JSON.stringify(EMCData.data),
              CFGDatum: JSON.stringify(CFGData.data[0])
            })
          });
        }
      })
    }
  })
});
app.get('/refresh',function(req,res){
   /*
  read from local
  */
  // var TempData = fs.readFileSync(tempDatapath, 'utf8');
  // var HumData = fs.readFileSync(humDatapath,'utf8');

  // res.render("timeseries",{
  //   TempDatum:JSON.stringify(JSON.parse(TempData).data),
  //   HumDatum:JSON.stringify(JSON.parse(HumData).data)
  // });
  
  var Tempurl = 'https://q.nqminds.com/v1/datasets/Sylsda0Un/data?opts={"sort":{"timestamp":-1,"sensorId":1},"limit":20000}';
  var EMCurl = 'https://q.nqminds.com/v1/datasets/BklEbvkv2/data?opts={"sort":{"timestamp":-1,"sensorId":1},"limit":20000}';
  RetriveData(Tempurl,function(err,TempData){
    if(!err){
      RetriveData(Humurl,function(err,HumData){
        if(!err){
              res.send({
                TempDatum:JSON.stringify(TempData.data),
                HumDatum:JSON.stringify(HumData.data)
            });
        }
      })
    }
  })
});

app.post('/moisture',function(req,res){
	var new_data = req.body;

	var datum = null;
	fs.open(datapath,'a+',function(err,data){
		if(err)
			console.log(err);
		else{
			fs.readFile(datapath,'utf8',function(err,data){
				if(data == null || data == ""){
					console.log('empty');
					datum = {
            id:moistureId,
						moisture:new_data
					};
					console.log('datum is => ')
          console.log(datum);
				}
				else{
					var values = JSON.parse(data).moisture;
					console.log('original value is=> '+values);
					if(util.isArray(values)){
						console.log('is array');
						values.push(new_data);
					}
					else{
						values = [];
						values.push(new_data);
					}
					datum = {
            id:moistureId,
						moisture:values
					};
				}

				fs.writeFile(datapath,JSON.stringify(datum),{ flag : 'w' },function(err){
					if(err)
						console.log(err);
          else{
            var cachedata = {
              id:moistureId,
              d:new_data
            };
            cache.cacheThis(cachedata);
          }
				});
			});
		}
	});
  res.send({"ans":"SUCCESS"});
});

app.post('/graintype',function(req,res){
	var new_data = req.body;
	console.log(new_data);
	var datum = null;
	fs.open(datapath2,'a+',function(err,data){
		if(err)
			console.log(err);
		else{
			fs.readFile(datapath2,'utf8',function(err,data){
				if(data == null || data == ""){
					console.log('empty');
					datum = {
						graintype:new_data
					};
					console.log('datum is => '+datum);
				}
				else{
					var values = JSON.parse(data).graintype;
					console.log('original value is=> '+values);
					if(util.isArray(values)){
						console.log('is array');
						values.push(new_data);
					}
					else{
						values = [];
						values.push(JSON.parse(data).graintype);
						values.push(new_data);
					}
					datum = {
						graintype:values
					};
				}
				fs.writeFile(datapath2,JSON.stringify(datum),{ flag : 'w' },function(err){
					if(err)
						console.log(err);
          else {
            var cachedata = {
              id: graintypeId,
              d: new_data
            };
            cache.cacheThis(cachedata);

          }
				});


			});
		}
	});
	res.send({"ans":"SUCCESS"});
})

app.post('/rate',function(req,res){
  var new_data = req.body;
  console.log(new_data);
  var datum = null;
  fs.open(datapath3,'a+',function(err,data){
    if(err)
      console.log(err);
    else{
      fs.readFile(datapath3,'utf8',function(err,data){
        if(data == null || data == ""){
          console.log('empty');
          datum = {
            discharge:new_data
          };
          console.log('datum is => '+datum);
        }
        else{
          var values = JSON.parse(data).discharge;
          console.log('original value is=> '+values);
          if(util.isArray(values)){
            console.log('is array');
            values.push(new_data);
          }
          else{
            values = [];
            values.push(JSON.parse(data).discharge);
            values.push(new_data);
          }
          datum = {
            discharge:values
          };
        }
        fs.writeFile(datapath3,JSON.stringify(datum),{ flag : 'w' },function(err){
          if(err)
            console.log(err);
          else {
            var cachedata = {
              id: rateId,
              d: new_data
            };
            cache.cacheThis(cachedata);
          }
        });
      });
    }
  });
  res.send({"ans":"SUCCESS"});
})



app.listen(PORT,function(){
	console.log('listen on '+PORT);
})

// dhtDriver.on('datum',handleDriverData);
// dhtDriver.start(1);

function RetriveData(URL,cb){
    http.get(URL, function(res){
      var body = '';

      res.on('data', function(chunk){
          body += chunk;
      });

      res.on('end', function(){
          var fbResponse = JSON.parse(body);
          //console.log("Got a response: ", fbResponse["data"]);
          cb(null,fbResponse);
      });
  }).on('error', function(e){
        console.log("Got an error: ", e);
        cb(err,null);
  });
}

function handleDriverData(TempData,HumData){
	console.log(TempData);
	console.log(HumData);

  var cacheTemp = {
    "id":TempId,
    "d":TempData
  }

  var cacheHum = {
    "id":HumId,
    "d":HumData
  }
	cache.cacheThis(cacheTemp);
  cache.cahcheThis(cacheHum);
	cache.saveTemp(TempData);
	cache.saveHum(HumData);
}
