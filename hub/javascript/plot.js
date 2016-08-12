
function CreatePlots(getData,index){
	var dataset1_array = [];
		for(var i=0;i<getData.length;i++){
			var each_object = getData[i].sensor_data[index];
			dataset1_array.push(each_object);
		}

		var x = d3.time.scale()
				.range([0, width]);

		var y = d3.scale.linear()
				.range([height, 0]);
		var y2 = d3.scale.linear()
				.range([height,0]);

		var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");

		var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left");
		var yAxis2 = d3.svg.axis()
				.scale(y)
				.orient("right");

		var tip = d3.tip()
	  			.attr('class', 'd3-tip')
	  			.offset([-10, 0])
	  			.html(function(d) {
	    			return "<p>"+d.Temp+"</p>";
	  			})
	  	var tip2 = d3.tip()
	  			.attr('class', 'd3-tip')
	  			.offset([-10, 0])
	  			.html(function(d) {
	    			return "<p>"+d.Hum+"</p>";
	  			})

		var svg = d3.select("#chart1").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var svg2 = d3.select("#chart2").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			svg.call(tip);
			svg2.call(tip)


		x.domain(d3.extent(dataset1_array, function(d) {return d.timestamp; }));
		y.domain([d3.min(dataset1_array,function(d){return d.Temp-10}),d3.max(dataset1_array,function(d){return d.Temp+10})]);
		y2.domain([d3.min(dataset1_array,function(d){return d.Hum-10}),d3.max(dataset1_array,function(d){return d.Hum+10})]);

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);
		svg2.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Temperature");
		svg2.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Temperature");

		var CreateTemp = d3.svg.line()
							.x(function(d){
								return x(d.timestamp);
							})
							.y(function(d){
								return y(d['Temp']);
							});
		var CreateHum = d3.svg.line()
							.x(function(d){
								return x(d.timestamp);
							})
							.y2(function(d){
								return y(d['Hum']);
							});

		svg.append('g:path')
			.attr('d',CreateTemp(dataset1_array))
			.attr('stroke', 'steelblue')
	  		.attr('stroke-width', 4)
	  		.attr('fill', 'none')
	  	svg.selectAll('.dot')
	  		.data(dataset1_array)
	  		.enter().append("circle")
	  		.attr('class','dot')
	  		.attr('r',3).style('fill','steelblue')
	  		.attr('cx',function(d){
	  			return x(d.timestamp);
	  		})
	  		.attr('cy',function(d){
	  			return y(d.Temp);
	  		})
	  		
	  		.on('mouseover',function(d,i){
	  			tip.show(d);
	  			d3.select(this).transition()
	            .ease("elastic")
	            .duration("300")
	            .attr("r", 7);
	  		})
	  		.on('mouseout',function(d,i){
	  			tip.hide(d);
	  			d3.select(this).transition()
	            .ease("elastic")
	            .duration("300")
	            .attr("r", 3);
	  		})

	  	svg2.append('g:path')
			.attr('d',CreateHum(dataset1_array))
			.attr('stroke', 'steelblue')
	  		.attr('stroke-width', 4)
	  		.attr('fill', 'none')
	  	svg2.selectAll('.dot')
	  		.data(dataset1_array)
	  		.enter().append("circle")
	  		.attr('class','dot')
	  		.attr('r',3).style('fill','steelblue')
	  		.attr('cx',function(d){
	  			return x(d.timestamp);
	  		})
	  		.attr('cy',function(d){
	  			return y(d.Hum);
	  		})
	  		
	  		.on('mouseover',function(d,i){
	  			tip.show(d);
	  			d3.select(this).transition()
	            .ease("elastic")
	            .duration("300")
	            .attr("r", 7);
	  		})
	  		.on('mouseout',function(d,i){
	  			tip.hide(d);
	  			d3.select(this).transition()
	            .ease("elastic")
	            .duration("300")
	            .attr("r", 3);
	  		});
}