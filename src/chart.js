//set up chart size
var chartWidth = (0.85 - mapRatio) * window.innerWidth;
var chartHeight = 0.5 * mapHeight;

//set up margins
var chartMargin = {
  top: 20,
  bottom: 40,
  left: 0,
  right: 0
};

//setup chart properties
var chartLocation = d3.select("#chart")
  .append("svg")
  .attr("id", "graph")
  .attr("width", chartWidth - chartMargin.left - chartMargin.right)
  .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
  .style("padding-left", "55px");

//set up chart info
var chartInfo = chartLocation.append("text")
  .attr("x", "50%")
  .attr("y", "50%")
  .attr("fill", "black")
  .attr("text-anchor", "middle")
  .text("Click on disasters to compare them.")
  .style("font-family", "verdana")
  .style("font-size", 11);

//show or hide information of info text on chart
function updateChartInfo() {
  if (ChartData.length === 0) {
    chartInfo.attr("opacity", 0.8);
  } else {
    chartInfo.attr("opacity", 0);
  }
}


//Create x and y axis ranges
var x = d3.scaleBand().rangeRound([0, chartWidth]).paddingInner(0.1);
var y = d3.scaleLinear().rangeRound([chartHeight, 0]);

var chart = chartLocation.append("g")
  .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");

//Initialize bar chart data and displayed type
var ChartData = [];
var dataType = "deaths";

chart.append("g")
  .attr("id", "xaxis")
  .attr("class", "axis axis--x")
  .attr("transform", "translate(0," + chartHeight + ")")
  .call(d3.axisBottom(x));

chart.append("g")
  .attr("id", "yaxis")
  .attr("class", "axis axis--y")
  .call(d3.axisLeft(y).ticks(10))
  .append("text")
  .attr("id", "chartlabel")
  .attr("transform", "translate(20,-20)")
  .attr("y", 6)
  .attr("dy", "0.71em")
  .attr("text-anchor", "end")
  .text("Deaths")
  .attr("fill", "black");

//Draw all bars (either updating or creating)
function reDrawChart() {

  var barCount = Math.max(ChartData.length, 5);
  x.domain(d3.range(0, barCount));
  y.domain([0, d3.max(ChartData, function(d) {
    return d.y;
  })]);

  d3.select("#chartlabel").transition().text(dataType);

  //  d3.select("#xaxis").call(d3.axisBottom(x).ticks(ChartData.length))
  d3.select("#yaxis").transition().call(d3.axisLeft(y).ticks(10));

  var bars = chart.selectAll(".bar").data(ChartData);

  //Remove
  bars.exit().remove();

  //Update
  bars.attr("class", function(d) {
      return d.class;
    })
    .classed("bar", true)
    .transition()
    .attr("x", function(d, i) {
      return x(i);
    })
    .attr("y", function(d) {
      return y(d.y);
    })
    .attr("width", function(d, i) {
      return x.bandwidth(i);
    })
    .attr("height", function(d) {
      return chartHeight - y(d.y);
    });

  //Add
  bars.enter().append("rect")
    .attr("class", function(d) {
      return d.class;
    })
    .classed("bar", true)
    .attr("x", function(d, i) {
      return x(i);
    })
    .attr("y", function(d) {
      return y(d.y);
    })
    .attr("width", function(d, i) {
      return x.bandwidth(i);
    })
    .attr("height", function(d) {
      return chartHeight - y(d.y);
    })
    .on("click", function(d) {
      d3.select(d.group).attr("clicked", "no");
      d.circle.transition().attr("r", function(d) {
        return d.rad / scale;
      });
      d.circle.classed("previewed", false);
      removeFromPinboard(d);
      hideTooltip();
    })
    .on("mouseover", function(d) {
      d.circle.transition().attr("r", 30 / scale);
      if (!(d.circle.classed("selected") && d.circle.classed("current"))) {
        d.circle.classed("previewed", true);
      }
      showTooltip(d.data, d.group);
    })
    .on("mouseout", function(d) {
      d.circle.transition().attr("r", function(d) {
        return d.rad / scale;
      });
      d.circle.classed("previewed", false);
      hideTooltip();
    });

  updateChartInfo();
}

//Unique identifier for bars on the chart
var globalCounter = 0;


//Add a new disaster to the chart
function addToPinboard(groupElement, data, classname) {

  var circle = d3.select(groupElement).select("circle");


  var newbar = {
    id: globalCounter,
    group: groupElement,
    y: Math.max(data[dataType], 0.01),
    circle: d3.select(groupElement).select("circle"),
    class: classname,
    data: data
  };

  circle.on("mouseover", function() {
    newbar.class = classname + " highlighted";
    reDrawChart();
  });

  circle.on("mouseout", function() {
    newbar.class = classname;
    reDrawChart();
  });

  globalCounter = globalCounter + 1;
  ChartData.push(newbar);
  reDrawChart();
}

function removeFromPinboard(data) {
  ChartData = ChartData.filter(function(event) {
    return event.id !== data.id;
  });
  reDrawChart();
}

//change the data type showed in the chart
function switchDataType(type) {
  dataType = type;
  ChartData.forEach(function(bar) {
    bar.y = Math.max(bar.data[type], 0.01);
  });
  reDrawChart();
}

reDrawChart();
