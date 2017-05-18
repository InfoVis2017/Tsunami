// standard aspect ratio
var mapAspectRatio = 3 / 4;

// 65% of screen width (div it is in = 70%);
var mapRatio = 0.65;

// setup the map dimensions
var mapWidth = mapRatio * window.innerWidth;
var mapHeight = mapAspectRatio * mapWidth;

//setup the projection and path generator
var projection = d3.geoMercator()
  .translate([(mapWidth / 2), (mapHeight / 2)])
  .scale(mapWidth / 2 / Math.PI);
var path = d3.geoPath()
  .projection(projection);

//setup zoom
var zoom = d3.zoom()
  .scaleExtent([1, 30])
  .on("zoom", zoomed);

//current scale for the zoom
var scale = 1;

//called to zoom
function zoomed() {
  scale = d3.event.transform.k;
  g.attr("transform", d3.event.transform);
  transformCircles();
}

//updating current selected circle --> make it bigger (bigger radius) and make
//the stroke bigger
function transformCircles() {
  g.selectAll("circle.current.selected")
    .attr("r", function(d) {
      return d.rad / scale;
    })
    .style("stroke-width", function(d) {
      return d.stw / scale;
    });
}

//append a svg to the map container and set up attributes
var svg = d3.select("#container")
  .append("svg")
  .attr("id", "map")
  .attr("height", mapHeight)
  .attr("width", mapWidth)
  .style("background", "#a1d6ff")
  .call(zoom);

//create group appended to svg
var g = svg.append("g");

//helping var
var leftLegend = true;

// register all the data on the map
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
      //set the clicked flag on no --> not selected
      .attr("clicked","no")
      //when mouse passes over cirlce, show the tooltip
      .on("mouseover", function(d) {
        showTooltip(d, this);
      })
      //when mouse quits the circle, hide tooltip
      .on("mouseout", hideTooltip)
      //when clicking on the circle, add it to the current selection
      .on("click", function(d) {
        //select clicked circle
        var thiscircle =  d3.select(this);
        //if already clicked do nothing, else add to current selection
        if (thiscircle.attr("clicked") == "no"){
          addToPinboard(this, d, classname);
          thiscircle.attr("clicked","yes");
        }
      });

    group.append("circle")
      .attr("class", classname)
      .style("stroke", "black");

    refreshYear();
  });

  // add to legend the disaster type
  var currentLegend = (leftLegend ? "#legend-left" : "#legend-right");
  var divke = d3.select(currentLegend).append("div");
  leftLegend = !leftLegend; // switch to other side for next item

  //add type of disaster and checkbox with right color ( see css)
  divke.attr("class", "press");
  divke.html(name);
  divke.style("font-family", "verdana")

  //append the checkbox
  divke.append("input")
    .attr("type", "checkbox")
    .attr("class", "cbx hidden")
    .attr("id", name)
    .on("change", function(d) {
      toggle(this, classname);
    });

  //append the label of the checkbox
  divke.append("label")
    .attr("class", "lbl " + classname)
    .attr("for", name);

}

/* load the world topology data */
d3.json("/data/topology/world-topo-min.json", function(error, data) {

  /* extract the JSON-encoded feature data for the countries */
  var countries = topojson.feature(data, data.objects.countries);

  /* main map manipulation */
  g.selectAll(".country")
    .data(countries.features)
    .enter().append("path")
    .attr("class", "country")
    .attr("d", path);

  /* setup disasters (cf. inf.) */
  registerData("Drought", "drought", "/data/disasters/emdat-leveled/drought.csv");
  registerData("Earthquake", "earthquake", "/data/disasters/emdat-leveled/earthquakes.csv");
  registerData("Epidemic", "epidemic", "/data/disasters/emdat-leveled/epidemic.csv");
  registerData("Floods", "flood", "/data/disasters/emdat-leveled/floods.csv");
  registerData("Landslide", "landslide", "/data/disasters/emdat-leveled/landslide.csv");
  registerData("Storms", "storm", "/data/disasters/emdat-leveled/storms.csv");

  initOverlays();
});
