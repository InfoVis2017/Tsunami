var map = new Datamap({
  element: document.getElementById("map")
});


// code from http://jsbin.com/sijijupiba/edit?html,output
// discussed in https://github.com/markmarkoh/datamaps/issues/230

map.addPlugin('earthquakes', function ( layer, data, options ) {  
    var self = this,
        fillData = this.options.fills,
        svg = this.svg;

    if ( !data || (data && !data.slice) ) {
      throw "Datamaps Error - bubbles must be an array";
    }

    var bubbles = layer.selectAll('image.datamaps-pins').data( data, JSON.stringify );

    bubbles
      .enter()
        .append('image')
        .attr('class', 'datamaps-pin')
        .attr('xlink:href', 'img/earthquake_blue.png')
        .attr('height', 40)
        .attr('width', 40)
        .attr('x', function ( datum ) {
          console.log('hey')
          var latLng;
          if ( datumHasCoords(datum) ) {
            latLng = self.latLngToXY(datum.latitude, datum.longitude);
          }
          else if ( datum.centered ) {
            latLng = self.path.centroid(svg.select('path.' + datum.centered).data()[0]);
          }
          if ( latLng ) return latLng[0];
        })
        .attr('y', function ( datum ) {
          var latLng;
          if ( datumHasCoords(datum) ) {
            latLng = self.latLngToXY(datum.latitude, datum.longitude);
          }
          else if ( datum.centered ) {
            latLng = self.path.centroid(svg.select('path.' + datum.centered).data()[0]);
          }
          if ( latLng ) return latLng[1];;
        })

        .on('mouseover', function ( datum ) {
          console.log('mousover!');
          var $this = d3.select(this);

          if (options.popupOnHover) {
            console.log('going', datum)
            self.updatePopup($this, datum, options, svg);
          }
        })
        .on('mouseout', function ( datum ) {
          var $this = d3.select(this);

          if (options.highlightOnHover) {
            //reapply previous attributes
            var previousAttributes = JSON.parse( $this.attr('data-previousAttributes') );
            for ( var attr in previousAttributes ) {
              $this.style(attr, previousAttributes[attr]);
            }
          }

          d3.selectAll('.datamaps-hoverover').style('display', 'none');
        })


    bubbles.exit()
      .transition()
        .delay(options.exitDelay)
        .attr("height", 0)
        .remove();

    function datumHasCoords (datum) {
      return typeof datum !== 'undefined' && typeof datum.latitude !== 'undefined' && typeof datum.longitude !== 'undefined';
    }
      
    });

map.addPlugin('tornados', function ( layer, data, options ) {  
    var self = this,
        fillData = this.options.fills,
        svg = this.svg;

    if ( !data || (data && !data.slice) ) {
      throw "Datamaps Error - bubbles must be an array";
    }

    var bubbles = layer.selectAll('image.datamaps-pins').data( data, JSON.stringify );

    bubbles
      .enter()
        .append('image')
        .attr('class', 'datamaps-pin')
        .attr('xlink:href', 'img/tornado.png')
        .attr('height', 40)
        .attr('width', 40)
        .attr('x', function ( datum ) {
          console.log('hey')
          var latLng;
          if ( datumHasCoords(datum) ) {
            latLng = self.latLngToXY(datum.latitude, datum.longitude);
          }
          else if ( datum.centered ) {
            latLng = self.path.centroid(svg.select('path.' + datum.centered).data()[0]);
          }
          if ( latLng ) return latLng[0];
        })
        .attr('y', function ( datum ) {
          var latLng;
          if ( datumHasCoords(datum) ) {
            latLng = self.latLngToXY(datum.latitude, datum.longitude);
          }
          else if ( datum.centered ) {
            latLng = self.path.centroid(svg.select('path.' + datum.centered).data()[0]);
          }
          if ( latLng ) return latLng[1];;
        })

        .on('mouseover', function ( datum ) {
          console.log('mousover!');
          var $this = d3.select(this);

          if (options.popupOnHover) {
            console.log('going', datum)
            self.updatePopup($this, datum, options, svg);
          }
        })
        .on('mouseout', function ( datum ) {
          var $this = d3.select(this);

          if (options.highlightOnHover) {
            //reapply previous attributes
            var previousAttributes = JSON.parse( $this.attr('data-previousAttributes') );
            for ( var attr in previousAttributes ) {
              $this.style(attr, previousAttributes[attr]);
            }
          }

          d3.selectAll('.datamaps-hoverover').style('display', 'none');
        })


    bubbles.exit()
      .transition()
        .delay(options.exitDelay)
        .attr("height", 0)
        .remove();

    function datumHasCoords (datum) {
      return typeof datum !== 'undefined' && typeof datum.latitude !== 'undefined' && typeof datum.longitude !== 'undefined';
    }
      
    });
       
      
       //bubbles, custom popup on hover template
     map.earthquakes([
       {name: 'Fake Quake', latitude: 21.32, longitude: 5.32, radius: 10, fillKey: 'gt50'},
       {name: 'Fake Quake', latitude: -25.32, longitude: 120.32, radius: 10, fillKey: 'lt50'},
       {name: 'Fake Quake', latitude: 21.32, longitude: -84.32, radius: 10, fillKey: 'gt50'},
      

     ], {
       popupOnHover: true,
       popupTemplate: function(data) {
         return "<div class='hoverinfo'>It is " + data.name + "</div>";
       }
     });

     37.1869584,-123.7641865,6
     map.tornados([
       {name: 'Fake Tornado', latitude: 37.1869584, longitude: -123.7641865, radius: 10, fillKey: 'gt50'},
       {name: 'Fake Tornado', latitude:39.9385466, longitude: 116.1172752, radius: 10, fillKey: 'gt50'},
      

     ], {
       popupOnHover: true,
       popupTemplate: function(data) {
         return "<div class='hoverinfo'>It is " + data.name + "</div>";
       }
     });