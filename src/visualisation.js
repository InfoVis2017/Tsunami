/* setup the dimensions */
var margin = { top: 50, bottom: 50, left: 50, right: 50 },
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

/* setup the projection and path generator */
var projection = d3.geoMercator()
                    .translate([width/2,height/2])
                    .scale(100)
var path = d3.geoPath()
              .projection(projection)

/* setup the basic elements */
var svg = d3.select("#container")
            .append("svg")
            .attr("id", "map")
            .attr("height", height + margin.top + margin.bottom)
            .attr("width", width + margin.left + margin.right)

var g = svg.append("g")
           .attr("transform", "translate("+margin.left+","+margin.top+")")

/* load the world topology data */
d3.json("/data/topology/world-topo-min.json", function(error, data) {

  /* extract the JSON-encoded feature data for the countries */
  var countries = topojson.feature(data,data.objects.countries)

  /* main map manipulation */
   g.selectAll(".country")
    .data(countries.features)
    .enter().append("path")
      .attr("class", "country")
      .attr("d", path)
});

/* let's add in the quakes */

/* do string->int conversion trick for a quake disaster */
function type(d) {
  d.Longitude = +d.Longitude
  d.Latitude = +d.Latitude
  d.Magnitude = +d.Magnitude
  return d
}

/* load and show the quakes */
d3.csv("/data/earthquakes.csv", type, function(err, quakes) {

  var min_magnitude = d3.min(quakes,function(d) { return d.Magnitude })
  var max_magnitude = d3.max(quakes,function(d) { return d.Magnitude })

  var scale = d3.scaleLinear()
                .domain([min_magnitude,max_magnitude])
                .range([1,7])

   g.selectAll(".quake")
    .data(quakes)
    .enter().append("circle")
      .attr("class", "quake")
      .attr("cx", function(d) {
        return projection([d.Longitude,d.Latitude])[0]
      })
      .attr("cy", function(d) {
        return projection([d.Longitude,d.Latitude])[1]
      })
      .attr("r", function(d) {
        return scale(d.Magnitude)
      })
});
