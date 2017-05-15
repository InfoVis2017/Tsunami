//startLoadScreen();

var aspectRatio = 3/4     // standard aspect ratio
var mapSize = 0.65        // 65% of screen width for map

var timeslidervalue = {}
/* setup the dimensions */
var margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  },
  width = (mapSize * window.innerWidth) - margin.left - margin.right,
  height = aspectRatio * width - margin.top - margin.bottom;

/* setup the projection and path generator */
var projection = d3.geoMercator()
  .translate([(width / 2), (height / 2)])
  .scale(width / 2 / Math.PI);

var path = d3.geoPath()
  .projection(projection);

var zoom = d3.zoom()
  .scaleExtent([1,30])
  .on("zoom", zoomed);

var scale = 1;
function zoomed() {
  scale = d3.event.transform.k;
  g.attr("transform", d3.event.transform);
  updateSelection();
}

function updateSelection() {
  g.selectAll("circle.current.selected")
    .attr("r", function(d) { return d.rad / scale })
    .style("stroke-width", function(d) { return d.stw / scale });
}

/* setup the basic elements */
var svg = d3.select("#container")
  .append("svg")
  .attr("id", "map")
  .attr("height", height + margin.top + margin.bottom)
  .attr("width", width + margin.left + margin.right)
  .call(zoom);

var g = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/* load the world topology data */
d3.json("/data/topology/world-topo-min.json", function(error, data) {

  /* extract the JSON-encoded feature data for the countries */
  var countries = topojson.feature(data, data.objects.countries);

  /* main map manipulation */
  g.selectAll(".country")
    .data(countries.features)
    .enter().append("path")
    .attr("class", "country")
    .attr("d", path)
    .on("mouseover", function() {
      var country = d3.select(this);
      var originalwidth = country.style("stroke-width");
      country.style("stroke-width", originalwidth + 0.5);
    })
    .on("mouseout", function() {
      var country = d3.select(this);
      var originalwidth = country.style("stroke-width");
      country.style("stroke-width", originalwidth - 0.5);
    });

  /* setup disasters (cf. inf.) */
  registerData("Drought", "drought", "/data/disasters/emdat-leveled/drought.csv")
  registerData("Earthquake", "earthquake", "/data/disasters/emdat-leveled/earthquakes.csv")
  registerData("Epidemic", "epidemic", "/data/disasters/emdat-leveled/epidemic.csv")
  //registerData("Extreme Temperature", "temperature", "/data/disasters/emdat-leveled/extreme-temperature.csv");
  registerData("Floods", "flood", "/data/disasters/emdat-leveled/floods.csv");
  //registerData("Insects", "insects", "/data/disasters/emdat-leveled/insects.csv");
  registerData("Landslide", "landslide", "/data/disasters/emdat-leveled/landslide.csv");
  //registerData("Mass Movement", "mass", "/data/disasters/emdat-leveled/mass-movement.csv");
  registerData("Storms", "storm", "/data/disasters/emdat-leveled/storms.csv");
});

/** DISASTERS **/

// setup an invisible tooltip
var div = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

function scaleRadius(damagelevel) {
  switch (damagelevel) {
    case 1:
      return 5
    case 2:
      return 10
    case 3:
      return 10
    case 4:
      return 15
  }
}

function scaleOpacity(damagelevel) {
  switch (damagelevel) {
    case 1:
      return 0.5
    case 2:
      return 0.75
    case 3:
      return 0.75
    case 4:
      return 1
  }
}

function scaleStrokeWidth(damagelevel) {
  switch (damagelevel) {
    case 1:
      return 0
    case 2:
      return 1
    case 3:
      return 1
    case 4:
      return 3
  }
}

function scaleOnAffected(scaler) {
  return function(d) {
    return scaler(d.affected_level);
  }
}

var leftLegend = true;

function registerData(name, classname, source) {

    d3.csv(source, convert, function(err, data) {
      // data preprocessing
      data.forEach(function(d) {
        d.rad = scaleOnAffected(scaleRadius)(d);
        d.stw = scaleOnAffected(scaleStrokeWidth)(d);
      });
      // add the data to the DOM tree
      var group = g.selectAll("." + classname)
        .data(data).enter().append("g")
        .attr("transform", function(d) {
          var crds = projection([d.lon, d.lat]);
          return "translate(" + crds[0] + "," + crds[1] + ")";
        })
        .on("mouseover", function(d) {
          div.html("<strong>Affected: </strong><span>" + d.affected + "</span>" +
              "<br><strong>Deaths: </strong><span>" + d.deaths + "</span>" +
              "<br><strong>Damage: </strong><span>$" + d.damage + "</span>")
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY + "px");
          div.transition().style("opacity", 0.9);
        })
        .on("mouseout", function(d) {
          div.transition().style("opacity", 0)
        })
        .on("click", function(d) {
          console.log(d);
          addToPinboard(d3.select(this), d, classname)
        })

      group.append("circle")
        .attr("class", classname)
        .style("stroke", "black");

      refreshYear();
  });

  // add to legend
  var currentLegend = (leftLegend? "#legend-left" : "#legend-right");
  var divke = d3.select(currentLegend).append("div");
  leftLegend = !leftLegend; // switch to other side for next item

  divke.attr("class", "press");

  divke.append("input")
    .attr("type", "checkbox")
    .attr("class", "cbx hidden")
    .attr("id", name)
    .on("change", function(d) {
      toggle(this, classname);
    });

  divke.append("span")
    .html(name);

  divke.append("label")
    .attr("class", "lbl " + classname)
    .attr("for", name);

}

function toggle(checkbox, name) {
  if (checkbox.checked) {
    includeData(name);
    updateSelection();
  } else {
    excludeData(name);
  }
}

function convert(d) {
  d.deaths = +d.deaths;
  d.damage = +d.damage;
  d.affected = Math.max(d.deaths, +d.affected);
  d.affected_level = +d.affected_level;
  d.lat = +d.lat;
  d.lon = +d.lon;
  /*
    TODO: just the start date is probably a bit too simplistic
    don't just parse using new Date(...), the format sometimes misses day/month
  */
  var date = d.start_date;
  d.year = +date.slice(date.length - 4, date.length);
  return d;
}

/* set the current year to filter out disasters (i.e. only show disasters from that year) */
/* again, for now we can just keep this global, clean code is for later :) */

var currentYear = 2000;

function setYear(year) {
  year = +year;
  if (currentYear !== year) {
    currentYear = year;
    refreshYear();
    document.getElementById("yearslot").innerHTML = year;
    updateSelection();
  }
}

function refreshYear() {
  g.selectAll(".current")
    .classed("current", false);
  g.selectAll("circle")
    .filter(function(d) {
      return d.year === currentYear;
    })
    .classed("current", true);
}

/* show/remove data on the visualisation, given the name of the 'disaster type' */
function includeData(name) {
  g.selectAll("." + name)
    .attr("r",function(d) { return d.rad / scale })
    .style("stroke-width",function(d) { return d.stw / scale })
    .classed("selected", true);
}

function excludeData(name) {
  g.selectAll("." + name)
    .classed("selected", false);
}

/////////////////////////////////////////////////////////////////////////////////
///                                 Chart                                    ////
/////////////////////////////////////////////////////////////////////////////////

var chartWidth = (0.9 - mapSize) * window.innerWidth;
var chartHeight = 0.5 * (height + margin.top + margin.bottom);

var chartMargin = {
  top: 20,
  bottom: 20,
  left: 0,
  right: 20
}

var chartLocation = d3.select("#chart")
  .append("svg")
  .attr("id", "graph")
  .attr("width", chartWidth + chartMargin.left + chartMargin.right)
  .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
  .style("padding-left","55px");

var chartInfo = chartLocation.append("text")
  .attr("x", "50%")
  .attr("y", "50%")
  .attr("fill", "black")
  .attr("text-anchor", "middle")
  .text("Click on disasters to compare them");

function updateChartInfo() {
  if(ChartData.length === 0) {
    chartInfo.attr("opacity",0.8)
  } else {
    chartInfo.attr("opacity",0)
  }
}

var x = d3.scaleBand().rangeRound([0, chartWidth]).paddingInner(0.1);
var y = d3.scaleLinear().rangeRound([chartHeight, 0]);

var chart = chartLocation.append("g")
  .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");
  

var ChartData = []
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
    .attr("id","chartlabel")
    .attr("transform", "translate(20,-20)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Deaths")
    .attr("fill", "black");

function reDrawChart() {

  var barCount = Math.max(ChartData.length,5);
  x.domain(d3.range(0, barCount));
  y.domain([0, d3.max(ChartData, function(d) {
    return d.y
  })]);

  d3.select("#chartlabel").transition().text(dataType);

  //  d3.select("#xaxis").call(d3.axisBottom(x).ticks(ChartData.length))
  d3.select("#yaxis").transition().call(d3.axisLeft(y).ticks(10))

  var bars = chart.selectAll(".bar").data(ChartData)

  //Remove
  bars.exit().remove();

  //Update
  bars.transition()
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
      d.circle.select("circle").transition()
        .attr("r", function(d) { return d.rad / scale; });
      removeFromPinboard(d);
    })
    .on("mouseover", function(d) {
      d.circle.select("circle").transition()
        .attr("r", 40 / scale);
    })
    .on("mouseout", function(d) {
      d.circle.select("circle").transition()
        .attr("r", function(d) { return d.rad / scale; });
    });

    updateChartInfo();
}

var globalCounter = 0;

function addToPinboard(groupElement, data, classname) {
  var newbar = {
    id: globalCounter,
    y : Math.max(data[dataType], 1),
    circle: groupElement,
    class: classname,
    deaths: data.deaths,
    affected: data.affected,
    damage: data.damage
  };
  globalCounter = globalCounter + 1;
  ChartData.push(newbar);
  reDrawChart();
}

function removeFromPinboard(data) {
  ChartData = ChartData.filter(function(event) {
    return event.id !== data.id;
  })
  reDrawChart();
}

function switchDataType(type){ 
  dataType = type
  ChartData.forEach(function(bar){
    bar.y = Math.max(bar[type],1);
  })

  reDrawChart();
}

reDrawChart();

/////////////////////////////////////////////////////////////////////////////////
///                                 Overlays                                 ////
/////////////////////////////////////////////////////////////////////////////////

function seaColor(value) {
  if (value) {
    svg.attr("class", "bluesea");
  } else {
    svg.attr("class", "nosea");
  }
}

function showBorders(value) {
  if (value) {
    g.selectAll(".country").style("stroke-width", 0.5);
  } else {
    g.selectAll(".country").style("stroke-width", 0);
  }
}

function showTectonic(bool) {
  if (bool) {
    g.selectAll('.tectonic').style("opacity", 0.5);
  } else {
    g.selectAll('.tectonic').style("opacity", 0);
  }
}

/*Add tectonic overlay*/

d3.json('/data/topology/tectonics.json', function(err, data) {

  g.insert("path", ".graticule")
    .datum(topojson.feature(data, data.objects.tec))
    .attr("class", "tectonic")
    .attr("d", path);

});

function toggleDropList(id) {
  document.getElementById(id).classList.toggle("show");
};

window.onclick = function(event) {
  if (!event.target.matches('.btn')) {

    var dropdowns = document.getElementsByClassName("dropdown-cntnt");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}
