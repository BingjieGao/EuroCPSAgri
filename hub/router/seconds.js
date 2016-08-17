var maxSec = new Date(1471285714141);
var minSec = new Date(1471006128710);
var buckets = d3.time.seconds(minSec,maxSec);
var newDate = [];
for(var i=0;i<buckets.length;i++){
    newDate[i] = {};
    newDate[i]['date'] = buckets[i];
}

console.log(newDate);
