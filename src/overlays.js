// show or hide rivers and lakes (change opacity from/to 0)
function riverColor(value) {
  if (value) {
    g.selectAll(".river").style("opacity", 1);
    g.selectAll(".lake").style("opacity", 1);
  } else {
    g.selectAll(".river").style("opacity", 0);
    g.selectAll(".lake").style("opacity", 0);
  }
}

//show country borders (change stroke width from/to 0)
function showBorders(value) {
  if (value) {
    g.selectAll(".country").style("stroke-width", 0.5);
  } else {
    g.selectAll(".country").style("stroke-width", 0);
  }
}

//show tectonic plates (change opacity from/to 0)
function showTectonic(bool) {
  if (bool) {
    g.selectAll('.tectonic').style("opacity", 0.5);
  } else {
    g.selectAll('.tectonic').style("opacity", 0);
  }
}


//Draw tectonic plates
function initOverlays() {

  //Draw tectonics
  d3.json('/data/topology/tectonics.json', function(err, data) {
    g.insert("path", ".graticule")
      .datum(topojson.feature(data, data.objects.tec))
      .attr("class", "tectonic")
      .attr("d", path);

      //Draw rivers
      d3.json("/data/topology/rivers.geojson", function(json) {
        g.selectAll("path")
          .data(json.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("class", "river");

          //Draw lakes
          d3.json("/data/topology/lakes.geojson", function(json) {
            g.selectAll("path")
              .data(json.features)
              .enter()
              .append("path")
              .attr("d", path)
              .attr("class", "lake");
          });
      });
  });
}
