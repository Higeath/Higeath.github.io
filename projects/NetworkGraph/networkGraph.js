		//Width and height
		var w = 1200;
		var h = 800;
		
		var edges = [];
		dataset.edges.forEach(function(e) { //References for edges to indexes 
			// Get the source and target nodes
			var sourceNode = dataset.nodes.filter(function(n) { return n.ID === e.source; })[0],
				targetNode = dataset.nodes.filter(function(n) { return n.ID === e.target; })[0];
			// Add the edge to the array
			edges.push({source: sourceNode, target: targetNode, officers: e.officers});
		});

		/* Scales */		
		var officersScale = d3.scale.linear()
								.domain([1,  d3.max(dataset.edges, function(d) { return d.officers.length; })])
								.range([2,5]);
		/* Scales */
		var viewBoxX = 0, viewBoxY = 0;
		var zoom = d3.behavior.zoom()
					.scaleExtent([0.1, 10])
					.on("zoom", zoomed);
		var drag = d3.behavior.drag()
					.on("dragstart", dragstarted)
					.on("drag", dragged)
					.on("dragend", dragended);


		//Initialize a default force layout, using the nodes and edges in dataset
		var omits =['plc', 'p.l.c.']; //Delete those before creating abbreviations
		dataset.nodes.forEach(
								function(d)
								{
									d.name = d.fullName.split(' ')
									.filter(function(part){ return !(omits.indexOf(part.toLowerCase())!==-1);})
									.map(function(w){return w[0];})
									.join('')}
								); 
		
		var force = d3.layout.force()
							 .nodes(dataset.nodes)
							 .links(edges)
							 .size([w, h])
							 .linkDistance([100])
							 .charge([-240])
							 .gravity(0.07)
							 .start();

		var colors = d3.scale.category10();

		var svg = d3.select("#networkGraph")
					.append("svg")
					.attr("width", w)
					.attr("height", h)
					.attr("viewBox", "0 0 "+w+" "+h);
		
		svg.append('rect')
		  .classed('bg', true)
		  .attr('stroke', 'transparent')
		  .attr('fill', 'transparent')
		  .attr("x", 0)
		  .attr("y", 0)
		  .attr('width', w)
		  .attr('height', h)
		  .call(zoom);
		
		var container = svg.append("g")
						.classed("node-area", true)
						.attr("transform", "translate(0,0)");
		
		var edge = container.selectAll(".edge")
			.data(edges)
			.enter()
			.append("g")
			.attr("class", "edge")
			.append("line")
			.attr("class", "link-edge")
			.style("stroke", function(d){return "rgb(0,"+(168-(officersScale(d.officers.length)*20))+","+(168-(officersScale(d.officers.length)*20))+")";})
			.style("stroke-width", function(d){return officersScale(d.officers.length);});
			
		var edgeText = container.selectAll(".edge")
						.append("text")
						.attr("dy", ".35em")
						.each(function(d){
							var officers = ''; 
							for (j = 0; j < d.officers.length; ++j) {
								d3.select(this).append("tspan")
									.text(d.officers[j])
									.attr("dy", j ? "1.2em" : 0)
									.attr("text-anchor", "middle")
									.attr("x", 0);
							}
						});
						
		var node = container.selectAll(".node")
			.data(dataset.nodes)
			.enter()
			.append("g")
			.attr("class", "node")
			.call(force.drag);
		  
		node.append("circle")
			.attr("r", 15)
			.style("fill", function(d,i){ 
				return colors(i)
			})
			.call(force.drag);

		node.append("text")
			.attr("dx", 0)
			.attr("dy", "0.35em")
			.attr("font-weight", 600)
			.attr("text-anchor", "middle") 
			.style("pointer-events", "none") 
			.text(function(d){ return d.name});
			
		//Every time the simulation "ticks", this will be called
		force.on("tick", function() {
			edge.attr("x1", function(d) { return d.source.x; })
				 .attr("y1", function(d) { return d.source.y; })
				 .attr("x2", function(d) { return d.target.x; })
				 .attr("y2", function(d) { return d.target.y; });
			edgeText.attr("transform", function(d) { return "translate(" + ((d.source.x + d.target.x)/2) + "," +((d.source.y + d.target.y)/2)+ ")"; });
			node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
		});
		
		function zoomed() {
		  container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		}
		function dragstarted(d) {
		}
		function dragged(d) {
			viewBoxX -= d3.event.dx;
			viewBoxY -= d3.event.dy;
			container.attr('transform', 'translate(' + (-viewBoxX) + ',' + (-viewBoxY) + ')scale('+zoom.scale()+')');
		}
		function dragended(d) {
		}
												
		function lapsedZoomFit(ticks, transitionDuration) {
			for (var i = ticks || 100; i > 0; --i) force.tick();
			force.stop();
			zoomFit(transitionDuration);
		}

		function zoomFit(transitionDuration) {
			var bounds = container.node().getBBox();
			var parent = container.node().parentElement;
			//var fullWidth = parent.clientWidth,
			//	fullHeight = parent.clientHeight;
			var fullWidth = w,
				fullHeight = h;
			var width = bounds.width,
				height = bounds.height;
			var midX = bounds.x + width / 2,
				midY = bounds.y + height / 2;
			if (width == 0 || height == 0) return; // nothing to fit
			var scale = 0.85 / Math.max(width / fullWidth, height / fullHeight);
			var translate = [w / 2 - scale * midX, h / 2 - scale * midY];

			//console.trace("zoomFit", translate, scale);
			//console.log(width+" "+height+" "+fullWidth+" "+fullHeight);
			
			container
				.transition()
				.duration(transitionDuration || 0) // milliseconds
				.call(zoom.translate(translate).scale(scale).event);
		}
		
		
		//User-Interactive functions
		node.on("mouseover", function(d){
			d3.select(this).select('text').text(function(d){return d.fullName;});
		});
		node.on("mouseout", function(d){
			d3.select(this).select('text').transition().delay(3000).text(function(d){return d.name;});
		});
		
		lapsedZoomFit(undefined, 0); //Center and zoom the graph to show all contents
			
		function reverse(){
			alert("test")
		}	
		//Right panel controls
		var ftse100 = node.filter(function(d){ return d.companyIndex == 'FTSE 100';});
		var ftse250 = node.filter(function(d){ return d.companyIndex == 'FTSE 250';});
		var ftseAS = node.filter(function(d){ return d.companyIndex == 'FTSE All-Share';});
		


		document.getElementById('FTSE100').onclick = function() {
			if ( this.checked ) {
				//console.log('FTSE 100');
				ftse100.style("visibility", "visible");
				ftse100.each(function(d,i){
					edge.filter(function(j){ return j.source.index==d.index||j.target.index==d.index;})
						.style("visibility","visible");
				});
				ftse250.each(function(d,i){
					edge.filter(function(j){ return j.source.index==d.index||j.target.index==d.index;})
						.style("visibility","hidden");
				});
				ftseAS.each(function(d,i){
					edge.filter(function(j){ return j.source.index==d.index||j.target.index==d.index;})
						.style("visibility","hidden");
				});
			} else{
				//console.log('-FTSE 100');
				ftse100.style("visibility", "hidden");
				ftse100.each(function(d,i){
					edge.filter(function(j){ return j.source.index==d.index||j.target.index==d.index;})
						.style("visibility","hidden");
				});
			}
		};
		
		document.getElementById('FTSE250').onclick = function() {
			if ( this.checked ) {
				//console.log('FTSE 250');
				ftse100.style("visibility", "visible");
				ftse250.style("visibility", "visible");

				ftse100.each(function(d,i){
					edge.filter(function(j){ return j.source.index==d.index||j.target.index==d.index;})
						.style("visibility","visible");
				});
				ftse250.each(function(d,i){
					edge.filter(function(j){ return j.source.index==d.index||j.target.index==d.index;})
						.style("visibility","visible");
				});
				ftseAS.each(function(d,i){
					edge.filter(function(j){ return j.source.index==d.index||j.target.index==d.index;})
						.style("visibility","hidden");
				});
				document.getElementById("FTSE100").checked = true;
				document.getElementById("FTSE100").disabled = true;
			} else {
				//console.log('-FTSE 250');
				ftse250.style("visibility", "hidden");
				ftse250.each(function(d,i){
					edge.filter(function(j){ return j.source.index==d.index||j.target.index==d.index;})
						.style("visibility","hidden");
				});
				document.getElementById("FTSE100").disabled = false;
			}
		};
		
		document.getElementById('FTSEA-S').onclick = function() {
			if ( this.checked ) {
				ftseAS.style("visibility", "visible");
				ftse250.style("visibility", "visible");
				ftse100.style("visibility", "visible");
				//console.log('FTSEA-S');
				edge.style("visibility","visible");
				document.getElementById("FTSE100").checked = true;
				document.getElementById("FTSE250").checked = true;
				document.getElementById("FTSE100").disabled = true;
				document.getElementById("FTSE250").disabled = true;
			} else {
				ftseAS.style("visibility", "hidden");
				//console.log('-FTSEA-S');
				ftseAS.each(function(d,i){
					edge.filter(function(j){ return j.source.index==d.index||j.target.index==d.index;})
						.style("visibility","hidden");
				});
				document.getElementById("FTSE100").disabled = true;
				document.getElementById("FTSE250").disabled = false;
			}
		};

		