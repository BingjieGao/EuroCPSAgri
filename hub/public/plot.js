function CreateBarChart(width,dataObj){
	console.log('draw');
	var width_original = width;
	var margin = {top: 20, right: 20, bottom: 50, left: 30};
	var heightAll = width /300*180 - 25;
	var width = width_original - margin.left - margin.right;
	var height = heightAll - margin.top - margin.bottom;
	console.log(width_original);
	console.log(width+'+'+margin.left);

	var id = [];

	var yLabel = []; 
	dataObj['Temp_data'].forEach(function(d){
		yLabel.push(d.sensorId.toString());
	})
	console.log(yLabel);

	var x = d3.scale.linear()
			.domain([d3.min(dataObj['Temp_data'],function(d){return d.Temp}),
				d3.max(dataObj['Temp_data'],function(d){return d.Temp})])
			.rangeRound([5,width-1]);

	var x2 = d3.scale.linear()
			.domain([d3.min(dataObj['Temp_data'],function(d){return d.Hum}),
				d3.max(dataObj['Temp_data'],function(d){return d.Hum})])
			.rangeRound([5,width-1]);

	var y = d3.scale.ordinal()
			.domain(dataObj['Temp_data'].map(function(d) { return d.sensorId; }))
			.rangeRoundBands([height,0],.1)

	var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom")
				.ticks(6)
	var xAxis2 = d3.svg.axis()
				.scale(x2)
				.orient("bottom")
				.ticks(6)

	var yAxis = d3.svg.axis()
				.scale(y)
				.orient('left')


	var barChart = d3.select('#temp-svg').append('svg')
					.attr('id','tempsvg')
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append('g')
					.attr("id","mainchart")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	/*
	* start plot xAxis call
	*/
	barChart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.append('text')
			.text("Temperature/°C")
			.style('text-anchor','end')
			.attr('transform','translate('+(width)+',30)')
			
	barChart.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append('text')
			.text("Sensors")
			.style('text-anchor','end')
			.attr('transform','translate(-20,0),rotate(-90)');

	barChart.selectAll('.bar')
			.data(dataObj['Temp_data'])
			.enter()
			.append('rect')
			.attr('class','bars')
			.on('mouseover',function(){
				d3.select(this).style('opacity','0.5')
			})
			.on('mouseout',function(){
				d3.select(this).style('opacity','1')
			})
			.attr("y", function(d){
				return y(d.sensorId.toString());
			})
			.attr('width',function(d){
				return x(d['Temp']);
			})
			.attr('height',y.rangeBand())


	var barChart2 = d3.select('#hum-svg').append('svg')
					.attr('id','humsvg')
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append('g')
					.attr("id","mainchart")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	/*
	* start plot xAxis call
	*/
	barChart2.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis2)
			.append('text')
			.text("RH/%")
			.style('text-anchor','end')
			.attr('transform','translate('+(width)+',30)')
			
	barChart2.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append('text')
			.text("Sensors")
			.style('text-anchor','end')
			.attr('transform','translate(-20,0),rotate(-90)');

	barChart2.selectAll('.bar')
			.data(dataObj['Temp_data'])
			.enter()
			.append('rect')
			.attr('class','bars')
			.on('mouseover',function(){
				d3.select(this).style('opacity','0.5')
			})
			.on('mouseout',function(){
				d3.select(this).style('opacity','1')
			})
			.attr("y", function(d){
				return y(d.sensorId.toString());
			})
			.attr('width',function(d){
				return x2(d['Hum']);
			})
			.attr('height',y.rangeBand())

}
function TimeLine(width,data){
	var margin = {top:10, right:20, bottom:10, left:0};
	var height = 80 - margin.top-margin.bottom;
	var x_timeline = d3.time.scale()
		.domain(d3.extent(data, function(d) {return d.timestamp; }))
		.nice()
		.range([5, width-5]);
	var dates = [];
		data.forEach(function(d){
		dates.push(d.timestamp);
	});

	var lastest = Math.max.apply(null,dates);
	var tLine = d3.select("#time-bar").append("svg")
		.attr("width",width)
		.attr("height",height)
		.append('g')
		.attr('transform','translate('+margin.left+','+margin.top+')');

	tLine.append('text')
	    	.text(new Date(lastest))
	    	.attr('id','timeline-label')
	    	.attr('transform','translate(0,'+margin.top/2+')');

	var tBar = tLine.append('rect')
		.attr('height',10)
		.attr('width',width)
		.attr('id','bar-rect')
		.attr('fill','gray')
		.attr('transform','translate(0,20)');

	var tMarker = tLine.selectAll('.bar-marker')
		.data(data).enter()
		.append('rect')
		.attr('class','bar-marker')
		.attr('fill','grey')
		.attr('height',16)
		.attr('width',5)
		.attr('transform',function(d){
			var xMove = x_timeline(d.timestamp);
			return "translate("+xMove+','+(20-3)+')';
		})

	var drag = d3.behavior.drag()
            .origin(Object)
            .on("drag", dragMove)
            .on('dragend', dragEnd);


    var drag_obj = tLine.append("circle")
	    .attr("r", 10)
	    .attr("cx", x_timeline(new Date(lastest)))
	    .attr("cy", 25)
	    .attr("fill", "#2394F5")
	    .call(drag);

	function dragMove(d) {
		
    d3.select(this)
        .attr("opacity", 0.6)
        .attr("cx",  Math.max(10,Math.min(width-10,d3.mouse(this)[0])));
}

	function dragEnd() {
		
		var cx = d3.select(this).attr("cx");
		var timeData = findNearest(x_timeline.invert(cx));
		
		cx = x_timeline(timeData.timestamp);
	    d3.select(this)
	        .attr('opacity', 1)
	        .attr("cx",cx);
	    d3.selectAll('#timeline-label').remove();
	    tLine.append('text')
	    	.text(timeData.timestamp)
	    	.attr('id','timeline-label')
	    	.attr('transform','translate(0,'+margin.top/2+')');
	    var chart_width = (width+30) * 0.49 -60;
	    d3.select('#tempsvg').remove();
	    d3.select('#humsvg').remove();
	    CreateBarChart(chart_width,timeData);
	}
  	function findNearest(xMouse){
  		console.log(xMouse);
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
}