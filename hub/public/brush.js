

function CreatePlots(width_original,TempData,index,timeData,display_array,ranges){
  //global variables of CreatePlots
  var margin = {top: 20, right: 150, bottom: 120, left: 45};
  var margin2 = {top:0.8,right:10,bottom: 20,left:40};
  var heightAll = width_original /300*150 - 25;
  var width = width_original - margin.left - margin.right;
  var height = heightAll - margin.top - margin.bottom;
  var height2 = (heightAll * 0.2) >70?70:(heightAll*0.2);

  var dataset1_array = [];
  var dates_array = [];
  var Tvalue_array = [];
  var Hvalue_array = [];
  /************************************************************************************/

  for(var i=0;i<TempData.length;i++){
    Tvalue_array.push(TempData[i]['Temp']);
    Hvalue_array.push(TempData[i]['Hum']);
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

  if(ranges != null) {
    if (!isNaN(ranges.TempMax))
      TempMax = ranges.TempMax;
    if (!isNaN(ranges.TempMin))
      TempMin = ranges.TempMin;
    if (!isNaN(ranges.HumMax))
      HumMax = ranges.HumMax;
    if (!isNaN(ranges.HumMin))
      HumMin = ranges.HumMin;
    if((ranges.TimeMin !=null) && (ranges.TimeMax !=null)){
      TimeMin = ranges.TimeMin;
      TimeMax = ranges.TimeMax;
      Xdomain = [TimeMin,TimeMax];
    }
  }

  var x = d3.time.scale()
    .domain(Xdomain)
    .nice()
    .range([5, width])
    .nice();
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
    .ticks(6);
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
    .attr("transform", "translate(" + 15+ ","+(height-30)+")")
    .attr("id","temp-label")
    .text("Celsius: ")
  label.append("text")
    .style("text-anchor","start")
    .attr("transform", "translate(" + 15+ ","+(height)+")")
    .attr("id","hum-label")
    .text("RH: ")
  var legend1 = label.append("rect")
    .attr('class','legend-box')
    .attr("width", 10)
    .attr("height", 10)
    .attr("transform", "translate(" + 0+ " ,"+(height-40)+")")
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
    .attr("transform", "translate(" + 0+ " ,"+(height-10)+")")
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
   * y axis and x axis
   */

  mainchart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll('text')
    .attr("transform", "translate("+5+",0),rotate(-45)");


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
    .text("Humidity/%");
  /*
   * *** draw the mark Line*********************************************************************
   */	var MarkValue, timeLabel;
  if(timeData!=null){
    Xtranslate = width*0.8 - x(timeData.timestamp);
    MarkValue = x(timeData.timestamp);
    timeLabel = timeData.timestamp;
  }
  else{
    Xtranslate = width*0.8 - x(lastestDate);
    MarkValue = x(lastestDate);
    timeLabel = lastestDate;

  }
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
  svg.select('#hum-label').text('RH: '+timeDataObj['Hum']+'%');
  //console.log(Xtranslate);
  /**********************************************************************************/

  if(ranges != null && ranges.TimeMax != null){
    Xtranslate = 0;
  }

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
      var cy_hum = y2(tipdata['Hum']);
      svg.selectAll("circle").remove();
      drawCircles(svg,cx,cy_temp,cy_hum);
      svg.selectAll('.y-lines').remove();
      drawXLines(x(tipdata.timestamp));
      svg.selectAll(".tooltip").remove();
      drawDateLabel(tipdata.timestamp)
      svg.select('#temp-label').text('Celsius: '+tipdata['Temp']+'°C');
      svg.select('#hum-label').text('RH: '+tipdata['Hum']+'%');
      ;
    }
  })
    .on('mouseout',function(){
      //removeAll();
    })
  /*********************************************************************************/
  var CreateHum = d3.svg.line()
    .x(function(d){
      if(ranges != null && ranges.TimeMax != null)
        return x(d.timestamp);
      else
        return (x(d.timestamp)+Xtranslate);
    })
    .y(function(d,i){
      if(d['Hum'] == 0) {
        var j = i;
        while(j>0){
          if(dataset1_array[j-1]['Hum'] != 0){
            return y2(dataset1_array[j-1]['Hum']);
            break;
          }
          else
            j--;
        }
        return y2(0);
      }
      else {
        return y2(d['Hum']);
      }
    })

  var CreateTemp = d3.svg.line()
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
    .x(function(d){
      return x2(d.timestamp);
    })
    .y(function(d,i){
      if(d['Hum'] == 0) {
        var j = i;
        while(j>0){
          if(dataset1_array[j-1]['Hum'] != 0){
            return yBrush2(dataset1_array[j-1]['Hum']);
            break;
          }
          else
            j--;
        }
        return yBrush2(0);
      }
      else {
        return yBrush2(d['Hum']);
      }
    })

  var CreateTempBrush = d3.svg.line()
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
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 3.5)
    .attr('fill', 'none')

  var HumLine = chartBody.append('g:path')
    .datum(dataset1_array)
    .attr('d',CreateHum)
    .attr('id','hum-line'+index.toString())
    .attr('class','hum-line')
    .attr('stroke', 'red')
    .attr('stroke-width', 3.5)
    .attr('fill', 'none')
  /***********************************************************************************/
  /*
   * define the hovered circle varaibles
   */
  var Temp_dot = mainchart.append('g')
    .attr('id','temp-dot'+index.toString());

  var Hum_dot = mainchart.append('g')
    .attr('id','hum-dot'+index.toString());
  /**********************************************************************************/

  var context = svg.append('g')
    .attr('class','context')
    .attr("transform", "translate(" + margin2.left + "," + (heightAll-100) + ")");

  context.append("path")
    .datum(dataset1_array)
    .attr("d", CreateTempBrush)
    .attr('class','temp-brushline')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 3.5)
    .attr('fill', 'none')

  context.append("path")
    .datum(dataset1_array)
    .attr("d", CreateHumBrush)
    .attr('class','hum-brushline')
    .attr('stroke', 'red')
    .attr('stroke-width', 3.5)
    .attr('fill', 'none')

  context.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis2)
    .selectAll('text')
    .attr("transform", "translate("+5+",0),rotate(-45)");;

  context.append("g")
    .attr("class", "x brush")
    .call(brush)
    .selectAll("rect")
    .attr("y", 10)
    .attr("height", height2-10);


  /***********************************************functions*********************************/
  function drawXLines(x){
    var Xvalue = x+Xtranslate;
    if(Xvalue>0 && Xvalue<width ){
      mainchart.append('g:line')
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
    cx = cx+Xtranslate
    if(cx<width && cx>0 && cy_temp<height && cy_temp>0){
      Temp_dot.append("circle")
        .attr('class','dot')
        .attr('r',5)
        .style('fill','steelblue')
        .attr('cx',cx)
        .attr('cy',cy_temp)
    }
    if(cx<width && cx>0 && cy_hum<height && cy_hum>0){
      Hum_dot.append("circle")
        .attr('class','dot')
        .attr('r',5)
        .style('fill','red')
        .attr('cx',cx)
        .attr('cy',cy_hum)
    }
  }
  function removeAll(){
    svg.selectAll("circle")
      .remove();
  }
  function drawDateLabel(date){

    var tooltip = mainchart.append("g")
      .attr("class", "tooltip")
      .attr("transform", "translate(" + 20+ " ,20)")
      .append("text")
      .text(new Date(date))

  }

  function zoomed() {
    Xtranslate = 0;

    svg.select(".x.axis").call(xAxis)
      .selectAll('text').attr("transform", "translate("+8+",0),rotate(-45)");

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
      "TimeMax":x.domain()[1],
      "TimeMin":x.domain()[0]
    }

    for(var i=0;i<display_array.length;i++){
      if(display_array[i]!=index) {
        d3.select('#svg' + (display_array[i] + 1).toString()).remove();
        CreatePlots(width_original, TempData, display_array[i], null, display_array, this_ranges);
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
    x.domain(brush.empty() ? x2.domain() : brush.extent());
    var this_ranges = {
      "TempMax":NaN,
      "TempMin":NaN,
      "HumMax":NaN,
      "HumMin":NaN,
      "TimeMax":x.domain()[1],
      "TimeMin":x.domain()[0]
    }
    svg.select(".hum-line").attr("d", CreateHum);
    svg.select('.temp-line').attr("d",CreateTemp);
    for(var i=0;i<display_array.length;i++){
      if(display_array[i] != index) {
        var this_svg = d3.select('#svg' + (display_array[i] + 1).toString());
        this_svg.remove();
        CreatePlots(width_original, TempData, display_array[i], null, display_array, this_ranges);
      }
    }
    svg.select(".x.axis").call(xAxis)
      .selectAll('text').attr("transform", "translate("+10+",0),rotate(-45)");
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
}


function TimeLine(width,data,display_array,chart_width){

  var margin = {top:40, right:20, bottom:37.5, left:20};
  //width = width - margin.right-margin.left;
  var height = 80-margin.top-margin.bottom
  /**********************************************************/
  var dates = [];
  var data_array = [];
  data.forEach(function(d){
    dates.push(d.timestamp);
  });

  var lastest = Math.max.apply(null,dates);
  /**********************************************************/

  var x_timeline = d3.time.scale()
    .domain(d3.extent(data, function(d) {return d.timestamp; }))
    .nice()
    .range([5, width]);


  var tLine = d3.select("#time-bar").append("svg")
    .attr("width",width)
    .attr("height",height+margin.top+margin.bottom)
    .append('g');

  //tLine.call(zoomTime);


  var tBar = tLine.append('rect')
    .attr('height',height)
    .attr('width',width)
    .attr('id','bar-rect')
    .attr('fill','gray')
    .attr('transform','translate(0,'+(height+margin.top)+')');

  var tMarker = tLine.selectAll('.bar-marker')
    .data(data).enter()
    .append('rect')
    .attr('class','bar-marker')
    .attr('fill','grey')
    .attr('height',15)
    .attr('width',1)
    .attr('transform',function(d){
      var xMove = x_timeline(d.timestamp);
      return "translate("+xMove+','+(height+margin.top-15)+')';
    })

  var drag = d3.behavior.drag()
    .origin(Object)
    .on("drag", dragMove)
    //.on('dragend', dragEnd);


  var drag_obj = tLine.append("circle")
    .attr("r", 6)
    .attr("cx", x_timeline(new Date(lastest)))
    .attr("cy", (height+margin.top+1.5))
    .attr("fill", "#2394F5")
    .call(drag);


  function zoomTimeLine() {
    console.log(x_timeline.domain());
    tMarker.remove();
    tLine.selectAll('.bar-marker')
      .data(data).enter()
      .append('rect')
      .attr('class','bar-marker')
      .attr('fill','grey')
      .attr('height',15)
      .attr('width',1)
      .attr('transform',function(d){
        var xMove = x_timeline(d.timestamp);
        return "translate("+xMove+','+(height+margin.top-15)+')';
      })

  }
  function dragMove(d) {
    d3.select(this)
      .attr("opacity", 0.6)
      .attr("cx",  Math.max(10,Math.min(width-10,d3.mouse(this)[0])));

    var cx = d3.select(this).attr("cx");
    var timeData = findNearest(x_timeline.invert(cx));
    cx = x_timeline(timeData.timestamp);
    d3.select(this)
      .attr('opacity', 1)
      .attr("cx",cx);

    d3.selectAll('.mark-lines').remove();
    //drawXLines(x_scale(timeData.timestamp));
    tLine.selectAll('text').remove();
    tLine.append('text')
      .text(new Date(timeData.timestamp))
      .attr('transform','translate(0,20)')

    for(var i = 0;i<display_array.length;i++){
      d3.select('#svg'+(display_array[i]+1).toString()).remove();
    }
    for(var i = 0;i<display_array.length;i++){
      CreatePlots(chart_width,data,display_array[i],timeData);
    }
  }

  function dragEnd() {


  }

  function findNearest(xMouse){
    console.log(xMouse);
    console.log(data);
    var MAX_NUMBER = Number.MAX_VALUE;
    var tipdata = null;
    data.forEach(function(d){
      var diff = Math.abs(d.timestamp - xMouse);
      if( diff < MAX_NUMBER){
        MAX_NUMBER = diff;
        tipdata = d;
      }
    })
    console.log(tipdata);
    return tipdata;
  }

}


