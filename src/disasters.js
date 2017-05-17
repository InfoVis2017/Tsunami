// setup an invisible tooltip
var tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// show a tooltip when on a circle with disaster information
function showTooltip(d, group) {
  var rect = group.getBoundingClientRect();
  tooltip.html("<strong>Affected: </strong><span>" + d.affected + "</span>" +
      "<br><strong>Deaths: </strong><span>" + d.deaths + "</span>" +
      "<br><strong>Damage: </strong><span>$" + d.damage + "</span>")
    .style("left", (rect.left + 20) + "px")
    .style("top", (rect.top - 20) + "px");
  tooltip.transition().style("opacity", 0.9);
}

//hide tooltip when quiting the circle
function hideTooltip() {
  tooltip.transition().style("opacity", 0);
}

//scale the radius of the circle (disaster), dependant on dammage level
function scaleRadius(damagelevel) {
  return damagelevel * 5;
}

//the stroke of the circle scales with the size of the disaster
function scaleStrokeWidth(damagelevel) {
  return damagelevel;
}

// create scaler with given scaler function
function scaleOnAffected(scaler) {
  return function(d) {
    return scaler(d.affected_level);
  };
}

//used to show and hide data when a checkbox is (un)checked
function toggle(checkbox, name) {
  if (checkbox.checked) {
    includeData(name);
    transformCircles();
  } else {
    excludeData(name);
  }
}

// convert string data to numbers
function convert(d) {
  d.deaths = +d.deaths;
  d.damage = +d.damage;
  d.affected = Math.max(d.deaths, +d.affected);
  d.affected_level = +d.affected_level;
  d.lat = +d.lat;
  d.lon = +d.lon;
  var date = d.start_date;
  d.year = +date.slice(date.length - 4, date.length);
  return d;
}

/* set the current year to filter out disasters (i.e. only show disasters from that year) */
var currentYear = 2000;

//change the year, refreshYear and tranform the circles with the current year
function setYear(year) {
  year = +year;
  if (currentYear !== year) {
    currentYear = year;
    refreshYear();
    document.getElementById("yearslot").innerHTML = year;
    transformCircles();
  }
}

//disable disasters and enable the disasters of the currentYear
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
    .attr("r", function(d) {
      return d.rad / scale;
    })
    .style("stroke-width", function(d) {
      return d.stw / scale;
    })
    .classed("selected", true);
}

//used to excluse data 
function excludeData(name) {
  g.selectAll("." + name)
    .classed("selected", false);
}
