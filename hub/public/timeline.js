function TimeLine(width,data){

	var margin = {top:20, right:20, bottom:50, left:20};
	//width = width - margin.right-margin.left;
	console.log(data);
	var height = 15;
	console.log(width);
	var x_timeline = d3.time.scale()
		.domain(d3.extent(data, function(d) {return d.timestamp; }))
		.range([5, width-5]);

	var tLine = d3.select("#time-bar").append("svg")
		.attr("width",width)
		.attr("height",10+margin.top)
		.append('g');

	var tBar = tLine.append('rect')
		.attr('height',10)
		.attr('width',width)
		.attr('id','bar-rect')
		.attr('fill','gray')
		.attr('transform','translate(0,10)');

	var drag = d3.behavior.drag()
            .origin(Object)
            .on("drag", dragMove)
            .on('dragend', dragEnd);


    var drag_obj = tLine.append("circle")
	    .attr("r", 10)
	    .attr("cx", 10)
	    .attr("cy", 15)
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
	        .attr("cx",cx)
	    drawXLines(cx);
	    tLine.append('text')
	    	.text(timeData.timestamp)
	       
	}
  	function drawXLines(x){
  		var mainchart = d3.selectAll('#mainchart');
		if(x>0 && x<width ){
			console.log("draw");
  		mainchart.append('line')
  		.attr('class','mark-lines')
  		.style('stroke','grey')
  		.style('stroke-opacity','50%')
  		.style('stroke-width',0.7)
  		.attr('x1',function(){
  				return x;
			})
			.attr('x2',function(){
				return x;
			})
			.attr('y1',function(){
				return 0;
			})
		
			.attr('y2',function(){
				return 50;
			});
		}
		
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