

function CreatePlots(width_original,TempData,index,display_array,ranges,CFGData,myBP){
  //global variables of CreatePlots
  var margin = {top: 5, right: 150, bottom: 70, left: 45};
  var margin2 = {right:10,bottom: 5,left:40};
  var heightAll = width_original /280*100 - 25;
  var width = width_original - margin.left - margin.right;
  var height = heightAll - margin.top - margin.bottom;
  var height2 = (heightAll * 0.2) >35?35:(heightAll*0.2);
  console.log('chart width is '+width);
  var dataset1_array = [];
  var dates_array = [];
  var Tvalue_array = [];
  var Hvalue_array = [];
  /************************************************************************************/

  for(var i=0;i<TempData.length;i++){
    Tvalue_array.push(TempData[i]['Temp']);
    Hvalue_array.push(TempData[i]['EMC']);
  }
  // Get data array from each sensor
  dataset1_array = findIndex(TempData,index);
  var TempMax,TempMin,HumMax,HumMin;
  var TimeMax,TimeMin;
  TempMax = Math.max.apply(null, Tvalue_array);
  TempMin = Math.min.apply(null, Tvalue_array);
  HumMax = Math.max.apply(null, Hvalue_array);
  HumMin = Math.min.apply(null, Hvalue_array);

  /*
   * yscale for brush
   */
  var yBrush = d3.scale.linear()
    .domain([TempMin,TempMax])
    .nice()
    .range([height2, 20])
    .nice();
  var yBrush2 = d3.scale.linear()
    .domain([HumMin,HumMax])
    .nice()
    .range([height2, 20])
    .nice();

  for(var i=0;i<dataset1_array.length;i++){
    dates_array.push(dataset1_array[i]['timestamp']);
  }
  var lastestDate =  Math.max.apply(null,dates_array);
  var earliestDate = lastestDate - 10*60*1000;

  var Xdomain = [earliestDate,lastestDate];
  var partialX = d3.time.scale()
    .domain(Xdomain)
    .nice()
    .range([5, width*0.8])
    .nice();
  var MaxDateToWidth = partialX.invert(width);
  Xdomain = [earliestDate,MaxDateToWidth];
  var x;
  x = d3.time.scale()
    .domain(Xdomain)
    .nice()
    .range([5, width])
    .nice();

  if(ranges != null) {
    if (!isNaN(ranges.TempMax))
      TempMax = ranges.TempMax;
    if (!isNaN(ranges.TempMin))
      TempMin = ranges.TempMin;
    if (!isNaN(ranges.HumMax))
      HumMax = ranges.HumMax;
    if (!isNaN(ranges.HumMin))
      HumMin = ranges.HumMin;
    if(ranges.Xdomain!=null){
      console.log(ranges.Xdomain(1471260740043));
      x = ranges.Xdomain;
    }
  }

  /*
   * scale for side bar brush
   */

  var x2 = d3.time.scale()
    .domain(d3.extent(TempData, function(d) {return d.timestamp; }))
    .range([0,width])
  /********************************************************/

  var y = d3.scale.linear()
    .domain([TempMin,TempMax])
    .nice()
    .range([height, 0])
    .nice()
  var y2 = d3.scale.linear()
    .domain([HumMin,HumMax])
    .nice()
    .range([height,0])
    .nice();

  var Xtranslate = 0;
  /*********************************************************************/

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(6)
  /*
   * xAxis for side brush
   */
  var xAxis2 = d3.svg.axis()
    .scale(x2)
    .orient("bottom")
    .ticks(6)
  /********************************************************/

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5);
  var yAxis2 = d3.svg.axis()
    .scale(y2)
    .orient("right")
    .ticks(6)


  var zoom = d3.behavior.zoom()
    .x(x)
    .y(y)
    .on("zoom", zoomed);

  var zoom_y2 = d3.behavior.zoom()
    .y(y2)


  var svg = d3.select("#chart"+(index+1).toString()+'-svg').append("svg")
    .attr("id","svg"+(index+1).toString())
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("pointer-events","all")


  var mainchart = svg.append("g")
    .attr("class","mainchart")
    .attr('id',"mainchart"+(index+1).toString())
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  /*
   * labels Temperature and Humdity on the right
   * legends
   */
  var label = mainchart.append("g")
    .attr("class", "label")
    .attr("transform", "translate(" + (width+10)+ " ,70)");

  label.append("text")
    .attr("transform", "translate(" + 15+ ","+(height-45)+")")
    .attr("id","temp-label")
    .text("Celsius: ")
  label.append("text")
    .style("text-anchor","start")
    .attr("transform", "translate(" + 15+ ","+(height-20)+")")
    .attr("id","hum-label")
    .text("EMC: ")
  var legend1 = label.append("rect")
    .attr('class','legend-box')
    .attr("width", 10)
    .attr("height", 10)
    .attr("transform", "translate(" + 0+ " ,"+(height-55)+")")
    .style("text-anchor","start")
    .style('fill','red')
    .on('mouseover',function(){
      d3.select(this).style('opacity','0.4')
    })
    .on('mouseout',function(){
      d3.select(this).style('opacity','1');
    })
    .on('click',function(){
      var legend_disabled = "legend-disabled";
      var chart_disabled = "chart-disabled";
      var chartIsDisabled = d3.select('#temp-line'+index.toString())
        .classed(chart_disabled);
      var legendIsDisabled = d3.select(this).classed(legend_disabled);
      d3.select(this).classed(legend_disabled,!legendIsDisabled);

      d3.select('#temp-line'+index.toString())
        .classed(chart_disabled,!chartIsDisabled);
      d3.select('#temp-dot'+index.toString())
        .classed(chart_disabled,!chartIsDisabled);
    })

  var legend2 = label.append("rect")
    .attr('class','legend-box')
    .attr("width", 10)
    .attr("height", 10)
    .attr("transform", "translate(" + 0+ " ,"+(height-30)+")")
    .style("text-anchor","start")
    .style('fill','steelblue')
    .on('mouseover',function(){
      d3.select(this).style('opacity','0.4')
    })
    .on('mouseout',function(){
      d3.select(this).style('opacity','1');
    })
    .on('click',function(){
      var legend_disabled = "legend-disabled";
      var chart_disabled = "chart-disabled";
      var chartIsDisabled = d3.select('#hum-line'+index.toString())
        .classed(chart_disabled);
      var legendIsDisabled = d3.select(this).classed(legend_disabled);
      d3.select(this).classed(legend_disabled,!legendIsDisabled);

      d3.select('#hum-line'+index.toString())
        .classed(chart_disabled,!chartIsDisabled);
      d3.select('#hum-dot'+index.toString())
        .classed(chart_disabled,!chartIsDisabled);
    })
  /****************************************************************************************/

  /*
   * call the zoom function
   */

  mainchart.call(zoom);

  var brush = d3.svg.brush()
    .x(x2)
    .on("brush", brushed);


  /*
   * *** draw the mark Line*********************************************************************
   */
  if(ranges == null || ranges.TimeMax == null || ranges.TimeMin == null){
    var MarkValue, timeLabel;
    Xtranslate = width*0.8 - x(lastestDate);
    MarkValue = x(lastestDate);
    timeLabel = lastestDate;
    drawXLines(MarkValue);
    // console.log(timeData);
    drawDateLabel(timeLabel);
    var timeDataObj = null;
    for(var i=0;i<dataset1_array.length;i++){
      if(dataset1_array[i]['timestamp'] == timeLabel){
        timeDataObj = dataset1_array[i];
      }
    }
    svg.select('#temp-label').text('Celsius: '+timeDataObj['Temp']+'°C');
    svg.select('#hum-label').text('EMC: '+timeDataObj['EMC']);
    svg.selectAll(".x.axis").call(xAxis)
      .selectAll('text').attr("transform", "translate("+10+",0),rotate(-20)");
  }
  //console.log(Xtranslate);
  /**********************************************************************************/

  if(ranges != null && ranges.TimeMax != null){
    Xtranslate = 0;
  }

  /*
   * y axis and x axis
   */

  mainchart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll('text')
    .attr("transform", "translate("+5+",0),rotate(-20)");


  mainchart.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "translate(-45,0),rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Temperature/°C");

  mainchart.append("g")
    .attr("class", "y2 axis")
    .attr("transform", "translate(" + width + " ,0)")
    .call(yAxis2)
    .append("text")
    .attr("transform", "translate(" + 20 + " ,0),rotate(-90)")
    .attr("y", 10)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("EMC");

  /*
   * clippath so that zoom won't exceed the plot area
   * hiding those pars outof bounds
   * the main graph should be drew in the chartBody
   */

  var clip = mainchart.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height);

  var chartBody = mainchart.append("g")
    .attr("clip-path", "url(#clip)")
    .attr('class','clippath');
  /**********************************************************************/
  /*
   * The rect area enables 'mouseover' within the plot area
   * cover all the charts in case other layers might exceed the actual plot rect area
   */
  var rectArea = mainchart.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "plot")

  /*********************************************************************************/

  rectArea.on('mousemove',function(){
    console.log(Xtranslate);
    var xMouse = x.invert(d3.mouse(this)[0]-Xtranslate);
    var yMouse = y.invert(d3.mouse(this)[1]);

    var tipdata = findNearest(xMouse,dataset1_array);
    if(tipdata != null){
      var cx = x(tipdata.timestamp);
      var cy_temp = y(tipdata['Temp']);
      var cy_hum = y2(tipdata['EMC']);
      d3.selectAll(".dot").remove();
      drawCircles(svg,cx,cy_temp,cy_hum);
      svg.selectAll('.y-lines').remove();
      drawXLines(x(tipdata.timestamp));
      svg.selectAll(".tooltip").remove();
      drawDateLabel(tipdata.timestamp);
      svg.select('#temp-label').text('Celsius: '+tipdata['Temp']+'°C');
      svg.select('#hum-label').text('EMC: '+tipdata['EMC']);
      ;
    }
  })
    .on('mouseout',function(){
      //removeAll();
    })
  /*********************************************************************************/
  var CreateHum = d3.svg.line()
    .defined(function(d){ return d['EMC']!=null})
    .x(function(d){
      if(ranges != null && ranges.TimeMax != null)
        return x(d.timestamp);
      else
        return (x(d.timestamp)+Xtranslate);
    })
    .y(function(d,i){
      if(d['EMC'] == 0) {
        var j = i;
        while(j>0){
          if(dataset1_array[j-1]['EMC'] != 0){
            return y2(dataset1_array[j-1]['EMC']);
            break;
          }
          else
            j--;
        }
        return y2(0);
      }
      else {
        return y2(d['EMC']);
      }
    })

  var CreateTemp = d3.svg.line()
    .defined(function(d){ return d['Temp']!=null})
    .x(function(d){
      if(ranges != null && ranges.TimeMax != null)
        return x(d.timestamp);
      else
        return (x(d.timestamp)+Xtranslate);
    })
    .y(function(d, i){
      if(d['Temp'] == 0) {
        var j = i;
        while(j>0){
          if(dataset1_array[j-1]['Temp'] != 0){
            return y(dataset1_array[j-1]['Temp']);
            break;
          }
          else
            j--;
        }
        return y(0);
      }
      else {
        return y(d['Temp']);
      }
    })

  var CreateHumBrush = d3.svg.line()
    .defined(function(d){ return d['EMC']!=null})
    .x(function(d){
      return x2(d.timestamp);
    })
    .y(function(d,i){
      if(d['EMC'] == 0) {
        var j = i;
        while(j>0){
          if(dataset1_array[j-1]['EMC'] != 0){
            return yBrush2(dataset1_array[j-1]['EMC']);
            break;
          }
          else
            j--;
        }
        return yBrush2(0);
      }
      else {
        return yBrush2(d['EMC']);
      }
    })

  var CreateTempBrush = d3.svg.line()
    .defined(function(d){ return d['Temp']!=null})
    .x(function(d){
      return x2(d.timestamp);
    })
    .y(function(d,i){
      if(d['Temp'] == 0) {
        var j = i;
        while(j>0){
          if(dataset1_array[j-1]['Temp'] != 0){
            return yBrush(dataset1_array[j-1]['Temp']);
            break;
          }
          else
            j--;
        }
        return yBrush(0);
      }
      else {
        return yBrush(d['Temp']);
      }
    })
  /*********************************************************************************/
  /*
   * Lines for the main graph
   */
  var TempLine = chartBody.append('g:path')
    .datum(dataset1_array)
    .attr('d',CreateTemp)
    .attr('class','temp-line')
    .attr('id','temp-line'+index.toString())
    .attr('stroke', 'red')
    .attr('stroke-width', 3.5)
    .attr('fill', 'none')

  var HumLine = chartBody.append('g:path')
    .datum(dataset1_array)
    .attr('d',CreateHum)
    .attr('id','hum-line'+index.toString())
    .attr('class','hum-line')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 3.5)
    .attr('fill', 'none')
  /***********************************************************************************/
  /*
   * define the hovesteelblue circle varaibles
   */
  var Temp_dot = mainchart.append('g')
    .attr('id','temp-dot'+index.toString());

  var Hum_dot = mainchart.append('g')
    .attr('id','hum-dot'+index.toString());
  /**********************************************************************************/

  var context = svg.append('g')
    .attr('class','context')
    .attr("transform", "translate(" + margin2.left + "," + (heightAll-60) + ")");

  context.append("path")
    .datum(dataset1_array)
    .attr("d", CreateTempBrush)
    .attr('class','temp-brushline')
    .attr('stroke', 'red')
    .attr('stroke-width', 3.5)
    .attr('fill', 'none')

  context.append("path")
    .datum(dataset1_array)
    .attr("d", CreateHumBrush)
    .attr('class','hum-brushline')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 3.5)
    .attr('fill', 'none')

  context.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," +height2 + ")")
    .call(xAxis2)
    .selectAll('text')
    .attr("transform", "translate("+5+",0),rotate(-20)");;

  context.append("g")
    .attr("class", "x brush")
    .call(brush)
    .selectAll("rect")
    .attr("height", height2);


  /***********************************************functions*********************************/
  function drawXLines(this_x){
    var Xvalue = this_x+Xtranslate;
    if(Xvalue>0 && Xvalue<width ){
      mainchart.append('g:line')
        .attr('class','y-lines')
        .style('stroke','grey')
        .style('stroke-opacity','50%')
        .style('stroke-width',1)
        .attr('x1',function(){
          return Xvalue;
        })
        .attr('x2',function(){
          return Xvalue;
        })
        .attr('y1',function(){
          return 0;
        })

        .attr('y2',function(){
          return height;
        })
        .on("click",function(){
          d3.selectAll('.y-lines').remove();
          drawAllXLines(Xvalue);
          d3.selectAll(".tooltip").remove();
          var click_date = x.invert(Xvalue-Xtranslate);
          drawAllDateLabel(click_date);
          var click_data = findTimeData(click_date.getTime(),null);

          var BPValue = findBPNN(click_date.getTime());
          console.log(BPValue);
          if(BPValue[0]['output'][0] != 0){
          	document.getElementById('BPValue').innerHTML = "Predicted EMC: ";
            document.getElementById('BPValue').innerHTML += BPValue[0]['output'][0].toFixed(2);
          }
          if(click_data.length>0){
            for(var i=0;i<display_array.length;i++){
              var click_svg = d3.select('#svg'+(display_array[i]+1).toString());
              var clickObj = click_data.find(function(o){
                return o['sensorId'] === display_array[i]+1;
              })
              var thisArray = findIndex(TempData,display_array[i]);

              var click_temp = clickObj===undefined?findNearest(click_date.getTime(),thisArray)['Temp']:clickObj['Temp'];
              var click_EMC = clickObj===undefined?findNearest(click_date.getTime(),thisArray)['EMC']:clickObj['EMC'];
              click_svg.select('#temp-label').text('Celsius: '+click_temp+'°C');
              click_svg.select('#hum-label').text('EMC: '+click_EMC);
            }
          }
        })
    }
  }
  function drawAllXLines(x){
    var Xvalue = x;
    if(Xvalue>0 && Xvalue<width ){
      d3.selectAll('.mainchart').append('g:line')
        .attr('class','y-lines')
        .style('stroke','grey')
        .style('stroke-opacity','50%')
        .style('stroke-width',0.7)
        .attr('x1',function(){
          return Xvalue;
        })
        .attr('x2',function(){
          return Xvalue;
        })
        .attr('y1',function(){
          return 0;
        })

        .attr('y2',function(){
          return height;
        });
    }

  }
  function drawCircles(svg,cx,cy_temp,cy_hum){
    cx = cx+Xtranslate;
    if(cx<width && cx>0 && cy_temp<height && cy_temp>0){
      Temp_dot.append("circle")
        .attr('class','dot')
        .attr('r',5)
        .style('fill','red')
        .attr('cx',cx)
        .attr('cy',cy_temp)
        .on("click",function(){
          d3.selectAll('.y-lines').remove();
          drawAllXLines(cx);
          d3.selectAll(".tooltip").remove();
          var click_date = x.invert(cx-Xtranslate);
          drawAllDateLabel(click_date);
          var click_data = findTimeData(click_date.getTime(),null);
          var BPValue = findBPNN(click_date.getTime());
          console.log(BPValue);

          if(BPValue[0]['output'][0] != 0){
            document.getElementById('BPValue').innerHTML = "Predicted EMC: ";
            document.getElementById('BPValue').innerHTML += BPValue[0]['output'][0].toFixed(2);
          }
          if(click_data.length>0){
            for(var i=0;i<display_array.length;i++){
              var click_svg = d3.select('#svg'+(display_array[i]+1).toString());
              var clickObj = click_data.find(function(o){
                return o['sensorId'] === display_array[i]+1;
              })
              var thisArray = findIndex(TempData,display_array[i]);

              var click_temp = clickObj===undefined?findNearest(click_date.getTime(),thisArray)['Temp']:clickObj['Temp'];
              var click_EMC = clickObj===undefined?findNearest(click_date.getTime(),thisArray)['EMC']:clickObj['EMC'];
              click_svg.select('#temp-label').text('Celsius: '+click_temp+'°C');
              click_svg.select('#hum-label').text('EMC: '+click_EMC);
            }
          }
        })
    }
    if(cx<width && cx>0 && cy_hum<height && cy_hum>0){
      Hum_dot.append("circle")
        .attr('class','dot')
        .attr('r',5)
        .style('fill','steelblue')
        .attr('cx',cx)
        .attr('cy',cy_hum)
        .on("click",function(){
          d3.selectAll('.y-lines').remove();
          drawAllXLines(cx);
          d3.selectAll(".tooltip").remove();
          var click_date = x.invert(cx-Xtranslate);
          drawAllDateLabel(click_date);
          var click_data = findTimeData(click_date.getTime(),null);
          var BPValue = findBPNN(click_date.getTime());
          console.log(BPValue);

          if(BPValue[0]['output'][0] != 0){
            document.getElementById('BPValue').innerHTML = "Predicted EMC: ";
            document.getElementById('BPValue').innerHTML += BPValue[0]['output'][0].toFixed(2);
          }
          if(click_data.length>0){
            for(var i=0;i<display_array.length;i++){
              var click_svg = d3.select('#svg'+(display_array[i]+1).toString());
              var clickObj = click_data.find(function(o){
                return o['sensorId'] === display_array[i]+1;
              })
              var thisArray = findIndex(TempData,display_array[i]);
              var click_temp = clickObj===undefined?findNearest(click_date.getTime(),thisArray)['Temp']:clickObj['Temp'];
              var click_EMC = clickObj===undefined?findNearest(click_date.getTime(),thisArray)['EMC']:clickObj['EMC'];
              click_svg.select('#temp-label').text('Celsius: '+click_temp+'°C');
              click_svg.select('#hum-label').text('EMC: '+click_EMC);
            }
          }
        })
    }
  }

  function drawDateLabel(date){

    var tooltip = mainchart.append("g")
      .attr("class", "tooltip")
      .attr("transform", "translate(" + 20+ " ,20)")
      .append("text")
      .text(new Date(date))
  }
  function drawAllDateLabel(date){

    var tooltip = d3.selectAll('.mainchart').append("g")
      .attr("class", "tooltip")
      .attr("transform", "translate(" + 20+ " ,20)")
      .append("text")
      .text(new Date(date))
  }

  function zoomed() {
    Xtranslate = 0;

    svg.select(".x.axis").call(xAxis)
      .selectAll('text').attr("transform", "translate("+8+",0),rotate(-20)");

    svg.selectAll(".y.axis").call(yAxis);

    svg.selectAll("path.temp-line")
      .attr('d',CreateTemp(dataset1_array));
    zoom_y2.scale(zoom.scale());
    zoom_y2.translate(zoom.translate());

    svg.selectAll(".y2.axis").call(yAxis2);
    //call the y2 Axis after y2 axis is zoomed

    svg.selectAll("path.hum-line")
      .attr('d',CreateHum(dataset1_array));
    //
    var this_ranges = {
      "TempMax":y.domain()[1],
      "TempMin":y.domain()[0],
      "HumMax":y2.domain()[1],
      "HumMin":y2.domain()[0],
      "TimeMax":NaN,
      "TimeMin":NaN,
      "Xdomain":x
    }
    for(var i=0;i<display_array.length;i++){
      if(display_array[i]!=index) {
        d3.select('#svg' + (display_array[i] + 1).toString()).remove();
        CreatePlots(width_original, TempData, display_array[i],display_array, this_ranges,CFGData,myBP);
      }
    }
    var this_domain = [];
    this_domain.push(x.domain()[0]<x2.domain()[0]?x2.domain()[0]:x.domain()[0]);
    this_domain.push(x.domain()[1]<x2.domain()[1]?x.domain()[1]:x2.domain()[1]);
    brush.extent(this_domain);
      svg.selectAll('.brush').call(brush);
    //for(var i=0;i<display_array.length;i++){
    //  var this_svg = d3.select('#svg' + (display_array[i] + 1).toString());
    //  this_svg.selectAll('.brush').call(brush);
    //  this_svg.select(".x.axis").call(xAxis)
    //    .selectAll('text').attr("transform", "translate("+5+",0),rotate(-45)");
    //}
    //d3.selectAll('.x.axis').selectAll('text').attr("transform", "translate("+5+",0),rotate(-45)");
  }

  function brushed(){
    Xtranslate = 0;
    x.domain(brush.empty() ? x2.domain() : brush.extent());
    var this_domain = [x.domain()[0],x.domain()[1]];
    console.log(this_domain);
    var this_ranges = {
      "TempMax":NaN,
      "TempMin":NaN,
      "HumMax":NaN,
      "HumMin":NaN,
      "TimeMax":NaN,
      "TimeMin":NaN,
      "Xdomain":x
    }
    var Xbrushed = d3.time.scale()
    .domain(x.domain())
    .nice()
    .range([5, width])
    .nice();

    svg.select(".hum-line").attr("d", CreateHum);
    svg.select('.temp-line').attr("d",CreateTemp);
    svg.selectAll(".x.axis").call(xAxis)
      .selectAll('text').attr("transform", "translate("+10+",0),rotate(-20)");
    for(var i=0;i<display_array.length;i++){
      if(display_array[i] != index) {
        var this_svg = d3.select('#svg' + (display_array[i] + 1).toString());
        this_svg.remove();
        CreatePlots(width_original, TempData, display_array[i],display_array, this_ranges,CFGData,myBP);
      }
    }
  }

  function findNearest(xMouse,data){
    var MAX_NUMBER = Number.MAX_VALUE;
    var tipdata = null;
    data.forEach(function(d){
      var diff = Math.abs(d.timestamp - xMouse);
      if( diff< MAX_NUMBER){
        MAX_NUMBER = diff;
        tipdata = d;
      }
    })
    return tipdata;
  }

  function findIndex(TempData,index){
    var ans_array = [];
    for(var i=0;i<TempData.length;i++) {
      if (TempData[i]['sensorId'] == index + 1) {
        var each_object = TempData[i];
        ans_array.push(each_object);
      }
    }
    return ans_array;
  }
  function findBPNN(timestamp){
  	var sensor22 = findTimeData(timestamp,22);
  	var sensor11 = findTimeData(timestamp,11);
  	var myout = [{output:[0]}]
  	if(sensor22 !== null && sensor11 !== null){
  		var inputs = [sensor22['EMC'],sensor11['EMC']];
  		var tdata = [{
      "timestamp": timestamp,
      "input": inputs
  		}];
  		myout = myBP.outputObtainedBPNN(tdata);
  		console.log(JSON.stringify(myout));
  	}
  	return myout;
  }

  function findTimeData(xMouse,Index){
    //console.log(xMouse);
    var tipdata = [];
    var dataObj = null;
    if(Index === null){
    TempData.forEach(function(d){
      	if(d.timestamp == xMouse){
        	tipdata.push(d);
      	}
    })
    console.log(tipdata);
    return tipdata;
  }else if(Index !== null){
  	TempData.forEach(function(d){
      	if(d.timestamp == xMouse && d.sensorId == Index){
      		console.log(d.EMC);
        	dataObj = d;
      	}
    })
    return dataObj;
  }
}
}
