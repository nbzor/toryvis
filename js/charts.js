$(document).ready(function () {

    var data = {};

    trends(callBack);
    topSites(function (d) {

        var color = d3.scale.category10();
        var eventDropsChart = d3.chart.eventDrops()
            .eventLineColor(function (datum, index) {
                return color(index);
            })
            .start(new Date(d.startTime))
            .end(new Date(d.endTime))
        eventDropsChart(d3.select('#chart_compare').datum(d.data));
    });

    function callBack(d) {
        data = d;
        new Chart('#chart_hour').create(data.hours);
        //new Chart('#chart_days').create(data.days);
        // new Chart('#chart_months').create(data.months);
        //new Chart('#chart_week').create(data.week);
    }

    var Chart = function (id) {
        this.id = id;
        var currData = {};
        var color = d3.scale.category10();
        var barColor = 'steelblue';
        var hG = {};
        var pC = {};      

        this.create = function (dt) {
            currData = dt;
            hG = histoGram(dt);
            pC = pieChart(data.overall.sites);
        };


        function histoGram(fD) {
            var hGDim = { t: 60, r: 0, b: 30, l: 0 };
            hGDim.w = 700 - hGDim.l - hGDim.r,
            hGDim.h = 300 - hGDim.t - hGDim.b;

            //create svg for histogram.           
            var hGsvg = d3.select(id).append("svg")
                .attr("width", hGDim.w + hGDim.l + hGDim.r)
                .attr('id', 'histogram')
                .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
                .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");

            $(id).append($(document.createElement('div')).attr('id', 'container_pie').css('display', 'block'));

            // create function for x-axis mapping.
            var x = d3.scale.ordinal().rangeRoundBands([0, hGDim.w], 0.1)
                    .domain(fD.map(function (d) { return d.value; }));

            // Add x-axis to the histogram svg.
            hGsvg.append("g").attr("class", "x axis")
                .attr("transform", "translate(0," + hGDim.h + ")")
                .call(d3.svg.axis().scale(x).orient("bottom"));

            // Create function for y-axis map.
            var y = d3.scale.linear().range([hGDim.h, 0])
                    .domain([0, d3.max(fD, function (d) { return d.count; })]);

            // Create bars for histogram to contain rectangles and freq labels.
            var bars = hGsvg.selectAll(".bar").data(fD).enter()
                    .append("g").attr("class", "bar");

            //create the rectangles.

            bars.append("rect")
            .attr("x", function (d) { return x(d.value); })
            .attr("y", function (d) { return y(d.count); })
            .attr("width", x.rangeBand())
            .attr("height", function (d) { return hGDim.h - y(d.count); })
            .attr('fill', barColor)
            .on("mouseover", mouseover)// mouseover is defined below.
            .on("mouseout", mouseout);// mouseout is defined below.



            //Create the frequency labels above the rectangles.
            bars.append("text").text(function (d) { return d3.format(",")(d.count) })
                .attr("x", function (d) { return x(d.value) + x.rangeBand() / 2; })
                .attr("y", function (d) { return y(d.count) - 5; })
                .attr("text-anchor", "middle");

            function mouseover(d) {  // utility function to be called on mouseover.
                // filter for selected state.                      
                var st = currData.filter(function (s) { return s.value == d.value; })[0];
                pC.update(st.sites);
            }

            function mouseout(d) {    // utility function to be called on mouseout.
                // reset the pie-chart and legend.    
                pC.update(data.overall.sites);
            }

            // create function to update the bars. This will be used by pie-chart.
            hG.update = function (nD, color) {
                // update the domain of the y-axis map to reflect change in frequencies.

                y.domain([0, d3.max(nD, function (d) { return d.count; })]);

                // Attach the new data to the bars.
                var bars = hGsvg.selectAll(".bar").data(nD);

                // transition the height and color of rectangles.
                bars.select("rect").transition().duration(500)
                    .attr("y", function (d) { return y(d.count); })
                    .attr("height", function (d) { return hGDim.h - y(d.count); })
                    .attr("fill", color);

                // transition the frequency labels location and change value.
                bars.select("text").transition().duration(500)
                    .text(function (d) { return d3.format(",")(d.count) })
                    .attr("y", function (d) { return y(d.count) - 5; });
            }
            return hG;
        }

        function pieChart(pD) {
            var pieDim = { w: 600, h: 250 };


            pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;

            var outerArc = d3.svg.arc()
                .innerRadius(pieDim.r * 0.9)
                .outerRadius(pieDim.r * 0.9);


            // create svg for pie chart.            
            var piesvg = d3.select(id + '> #container_pie').append("svg")
                .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
                .attr("transform", "translate(" + pieDim.w / 2 + "," + pieDim.h / 2 + ")");

            piesvg.append("g").attr("class", "slice");
            piesvg.append("g").attr("class", "labels");
            piesvg.append("g").attr("class", "lines");

            // create function to draw the arcs of the pie slices.
            var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);

            // create a function to compute the pie slice angles.
            var pie = d3.layout.pie().sort(null).value(function (d) { return d.count; });

            // Draw the pie slices.
            piesvg.select(".slice").selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
                .each(function (d) { this._current = d; })
                .style("fill", function (d) { return color(d.data.count); })
                .on("mouseover", mouseover).on("mouseout", mouseout);


            function midAngle(d) {
                return d.startAngle + (d.endAngle - d.startAngle) / 2;
            }            
           

            updateText(pD);

            function updateText(dt) {                
                var text = piesvg.select(".labels").selectAll("text").data(pie(dt));                  

                text.enter()
                    .append("text")
                    .attr("dy", ".35em");
                    

                text.transition().duration(1000)
                    .attrTween("transform", function (d) {
                        this._current = this._current || d;
                        var interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(0);
                        return function (t) {
                            var d2 = interpolate(t);
                            var pos = outerArc.centroid(d2);
                            pos[0] = pieDim.r * (midAngle(d2) < Math.PI ? 1 : -1);
                            return "translate(" + pos + ")";
                        };
                    })
                    .styleTween("text-anchor", function (d) {
                        this._current = this._current || d;
                        var interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(0);
                        return function (t) {
                            var d2 = interpolate(t);
                            return midAngle(d2) < Math.PI ? "start" : "end";
                        };
                    }).text(function (d) {
                        return d.data.site + ' (' + d.data.count+ " - " + getPercentage(d.data,dt)+')';
                    });
                text.exit()
                    .remove();

            


                /*----------SLICE TO TEXT POLYNINES----------*/
                var polyline = piesvg.select(".lines").selectAll("polyline")
                    .data(pie(dt));

                polyline.enter()
                    .append("polyline");

                polyline.transition().duration(1000)
                    .attrTween("points", function (d) {
                        this._current = this._current || d;
                        var interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(0);
                        return function (t) {
                            var d2 = interpolate(t);
                            var pos = outerArc.centroid(d2);
                            pos[0] = pieDim.r * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                            return [arc.centroid(d2), outerArc.centroid(d2), pos];
                        };
                    });

                polyline.exit()
                    .remove();               
            }           
            

            function getPercentage(d, aD) {              
                return d3.format("%")(d.count / d3.sum(aD.map(function (v) { return v.count; })));
            }

            // create function to update pie-chart. This will be used by histogram.
            pC.update = function (nD) {
                piesvg.select('.slice').selectAll("path").data(pie(nD)).transition().duration(1000)
                    .attrTween("d", arcTween);
                updateText(nD);
            }
            // Utility function to be called on mouseover a pie slice.
            function mouseover(d) {
                // call the update function of histogram with new data.          

                hG.update(currData.map(function (v) {
                    var index = contains(d.data.site, v.sites);
                    return index == -1 ? { value: v.value, count: 0 } : { value: v.value, count: v.sites[index].count };
                }), color(d.data.count));

            }
            //Utility function to be called on mouseout a pie slice.
            function mouseout(d) {
                // call the update function of histogram with all data.               
                hG.update(currData.map(function (v) {
                    return { value: v.value, count: v.count };
                }), barColor);
            }
            // Animating the pie-slice requiring a custom function which specifies
            // how the intermediate paths should be drawn.
            function arcTween(a) {
                var i = d3.interpolate(this._current, a);
                this._current = i(0);
                return function (t) { return arc(i(t)); };
            }
            return pC;
        }

    };

});