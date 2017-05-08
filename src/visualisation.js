/* setup the dimensions */
var margin = { top: 50, bottom: 50, left: 50, right: 50 },
    width = (0.75 * window.innerWidth) - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

/* setup the projection and path generator */
var projection = d3.geoMercator()
                    .translate([(width/2), (height/2)])
                    .scale( width / 2 / Math.PI);

var path = d3.geoPath()
              .projection(projection);

/* setup the basic elements */
var svg = d3.select("#container")
            .append("svg")
            .attr("id", "map")
            .attr("height", height + margin.top + margin.bottom)
            .attr("width", width + margin.left + margin.right);

var g = svg.append("g")
           .attr("transform", "translate("+margin.left+","+margin.top+")");

d3.select("#legend")
    .append("br");

/* load the world topology data */
d3.json("/data/topology/world-topo-min.json", function(error, data) {

  /* extract the JSON-encoded feature data for the countries */
  var countries = topojson.feature(data,data.objects.countries);

  /* main map manipulation */
   g.selectAll(".country")
    .data(countries.features)
    .enter().append("path")
      .attr("class", "country")
      .attr("d", path)
      .style("fill", function(d, i) {
        return '#eeeeee';
      });

  /* setup disasters (cf. inf.) */
  registerData("Drought","drought",["/data/disasters/emdat/drought.csv"])
  registerData("Earthquake","earthquake",["/data/disasters/emdat/earthquakes.csv"])
  registerData("Epidemic","epidemic",["/data/disasters/emdat/epidemic.csv"])
  registerData("Extreme Temperature","temperature",["/data/disasters/emdat/extreme-temperature.csv"]);
  registerData("Floods","flood",["/data/disasters/emdat/floods.csv"]);
  registerData("Insects","insects",["/data/disasters/emdat/insects.csv"]);
  registerData("Landslide","landslide",["/data/disasters/emdat/landslide.csv"]);
  registerData("Mass Movement","mass",["/data/disasters/emdat/mass-movement.csv"]);
  registerData("Storms","storm",["/data/disasters/emdat/storms.csv"]);
})

/** DISASTERS **/

function registerData(name,classname,sources) {
  for(var i = 0; i < sources.length; ++i) {
    d3.csv(sources[i], convert, function(err,data) {

      var scale = d3.scaleLinear()
                    .domain([0,1000000])    // scale from #affected persons
                    .range([0.5,1]);       // to predetermined minimum/maximum radius

      var group = g.selectAll("." + classname)
                      .data(data).enter().append("g")
                        .attr("transform", function(d) {
                          var crds = projection([d.lon,d.lat]);
                          return "translate(" + crds[0] + "," + crds[1] + ")";
                        })
                        .on("mouseover", function() {showDetails(d3.select(this))})
                        .on("mouseout", function() {hideDetails(d3.select(this))})

      group.append("circle")
              .attr("class",classname)
              .attr("r", 10)                  // radius is fixed
              .style("opacity", function(d) {
                return scale(d.deaths);
              });

    });
  }
  // add to legend
  d3.select("#legend")
    .append("label")
      .attr("class",classname)
      .text(name)
      .append("input")
        .attr("type","checkbox")
        .on("change",function(d) {
          toggle(this,classname);
          refreshYear();
        });

  d3.select("#legend")
      .append("br");
}

function toggle(checkbox,name) {
  if(checkbox.checked) {
    includeData(name);
  } else {
    excludeData(name);
  }
}

function convert(d) {
  d.affected = +d.affected;
  d.deaths = +d.deaths;
  d.damage = +d.damage;
  d.lat = +d.lat;
  d.lon = +d.lon;
  /*
    TODO: just the start date is probably a bit too simplistic
    don't just parse using new Date(...), the format sometimes misses day/month
  */
  var date = d.start_date;
  d.year = +date.slice(date.length-4,date.length);
  return d;
}

/* set the current year to filter out disasters (i.e. only show disasters from that year) */
/* again, for now we can just keep this global, clean code is for later :) */

var currentYear = 2000;

function setYear(year) {
  year = +year;
  if(currentYear !== year) {
    currentYear = year;
    refreshYear();
  }
}

function refreshYear() {
  g.selectAll(".current")
    .classed("current",false);
  g.selectAll("circle")
    .filter(function(d) { return d.year === currentYear; })
    .classed("current",true);
}

/* show/remove data on the visualisation, given the name of the 'disaster type' */
function includeData(name) {
  g.selectAll("." + name)
    .classed("selected", true);
}

function excludeData(name) {
  g.selectAll("." + name)
    .classed("selected", false);
}

function showDetails(disaster) {
  disaster.select("circle").transition().attr("r",50)
  disaster.append("text")
          //.style("visibility","hidden")
          .attr("text-anchor","middle")
          .html("Test text")
}

function hideDetails(disaster) {
  disaster.select("circle").transition().attr("r",10)
  disaster.select("text").remove()
}
