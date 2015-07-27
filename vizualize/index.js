
var points = [];
function plotMap() {
  onSuccess = function(data) {
      var mapOptions = {
        zoom: 13,
        center: new google.maps.LatLng(45.465892400000001317, -122.69269230000000448),
      };

      map = new google.maps.Map(
          document.getElementById('map-canvas'),
          mapOptions
      );

      var bounds = new google.maps.LatLngBounds();

      $.each(data.rows, function( key, row) {
          position_dict = row.doc;
          point = new google.maps.LatLng(position_dict.latitude, position_dict.longitude);
          points.push(point);
          var marker = new google.maps.Marker({
              position: point,
              map: map,
              title:"Hello World!"
          });
          var infowindow = new google.maps.InfoWindow({
              content: JSON.stringify(position_dict.ssids)
          });
          google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map,marker);
          });
          var circle = new google.maps.Circle({
              center: point,
              radius: position_dict.accuracy,
              map: map,
              // fillColor: //color,
              fillOpacity: 0.1 //opacity from 0.0 to 1.0,
              // strokeColor: //stroke color,
              // strokeOpacity: //opacity from 0.0 to 1.0
          });

          // Extend bound for centering
          bounds.extend(marker.position);

      });

      // Center map on markers
      map.fitBounds(bounds);

      //points = [new google.maps.LatLng(37.782551, -122.445368)];
      //debugger;
      //points.splice(10);
      // var pointArray = new google.maps.MVCArray(points);
      // heatmap = new google.maps.visualization.HeatmapLayer({
      //     data: pointArray
      // });
  };
  $.getJSON('simple_set.json', onSuccess);

}
google.maps.event.addDomListener(window, 'load', plotMap);
