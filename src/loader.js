function loader() {
      var svg_loader = d3.select("#loader_container").append("svg")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight)
        .append("g")
          .attr("transform", "translate( 480 250 )")
          .attr("clip-path", "url(#clip)");

      var smallest_radius = Math.min(window.innerWidth, window.innerHeight) * 0.35;
      var biggest_radius  = Math.min(window.innerWidth, window.innerHeight) * 0.40;


      var arc = d3.arc()
        .innerRadius(smallest_radius)
        .outerRadius(biggest_radius);

      var clip = svg_loader.append("defs")
        .append("clipPath")
          .attr("id", "clip")
          .append("path");

      svg_loader.selectAll("path")
        .data(d3.range(0, 181))
        .enter()
        .append("path")
          .style("fill",function(d){
            return d3.interpolateRainbow(d / 180);
          })
          .style("stroke",function(d){
            return d3.interpolateRainbow(d / 180);
          })
          .attr("d",function(d){
            return arc.startAngle(d * Math.PI / 90)
              .endAngle(++d * Math.PI / 90)();
          });

      d3.timer(function(t){
        svg_loader.attr("transform","translate( 480 250 ) rotate(" + (360 * t / 5000 % 5000) + ")");
      });

      arc.startAngle(0)
        .endAngle(Math.PI * 5 / 4);

      stretch();

      function stretch(end) {

        var angle = arc[end ? "endAngle" : "startAngle"],
            interpolate = d3.interpolateNumber(angle()(), angle()() + Math.PI * 9 / 8);

        clip.transition()
          .delay(500)
          .duration(1000)
          .attrTween("d",function(){
            return function(t){
              return angle(interpolate(t))();
            };
          })
          .on("end", function(){
            stretch(!end);
          });

      }
    }

function startLoadScreen(){
  document.getElementById('main').style.opacity=0.25;
  document.getElementById('loader_container').style.position='absolute';
  loader();
  }

function endLoadScreen(){
  document.getElementById('main').style.opacity=1;
  var myNode = document.getElementById("loader_container");
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
    }
  }