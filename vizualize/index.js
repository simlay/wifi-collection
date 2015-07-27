var all_hotspots = [];
var points = [];
var overlays = [];

var bcircle = {
  url: 'blue-circle.png',
  // This marker is 20 pixels wide by 32 pixels tall.
  size: new google.maps.Size(16, 16),
  // The origin for this image is 0,0.
  origin: new google.maps.Point(0,0),
  // The anchor for this image is the base of the flagpole at 0,32.
  anchor: new google.maps.Point(8, 8)
};

var mapdata;

// ======= This function handles selections from the select box ====
function handleSelected(opt) {
  console.log(opt.selectedIndex - 1);

  var selected_hotspot = all_hotspots[opt.selectedIndex - 1];

  // clear map overlays
  while (overlays[0]){
    overlays.pop().setMap(null);
  }

  // Render accuracy if requested
  if (opt.selectedIndex == 0) {
    $.each(mapdata.rows, function(key, row) {
      position_dict = row.doc;
      hotspots_sample = position_dict.ssids;

      point = new google.maps.LatLng(position_dict.latitude, position_dict.longitude);

      var marker = new google.maps.Marker({
          icon: bcircle,
          position: point,
          map: map,
          title:"Hello World!"
      });

      overlays.push(marker);

      var infowindow = new google.maps.InfoWindow({
          content: JSON.stringify(position_dict)
      });

      google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
      });

      var circle = new google.maps.Circle({
          center: point,
          radius: position_dict.accuracy,
          map: map,
          fillColor: "#0000AA",
          fillOpacity: 0.1, //opacity from 0.0 to 1.0,
          strokeColor: "#000088",//stroke color,
          strokeOpacity: 0.4//opacity from 0.0 to 1.0
      });
      overlays.push(circle);
    });
  }

  $.each(mapdata.rows, function(key, row) {
    position_dict = row.doc;
    hotspots_sample = position_dict.ssids;

    point = new google.maps.LatLng(position_dict.latitude, position_dict.longitude);

    var i;
    for (i = 0; i < hotspots_sample.length; i++) {
      if (hotspots_sample[i].BSSID == selected_hotspot) { // Not yet in all_hotspots array
        console.log("")
        //all_hotspots.push(hotspots_sample[i].BSSID)


        var marker = new google.maps.Marker({
          icon: bcircle,
          position: point,
          map: map,
          title:"Hello World!"
        });

        overlays.push(marker);

        var infowindow = new google.maps.InfoWindow({
            content: JSON.stringify(hotspots_sample[i])
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);
        });


        var circle = new google.maps.Circle({
            center: point,
            //radius: position_dict.accuracy,
            radius: Math.pow(10,-hotspots_sample[i].level/20)/600,
            map: map,
            fillColor: "#550000",
            fillOpacity: 0.1, //opacity from 0.0 to 1.0,
            strokeColor: "#880000",//stroke color,
            strokeOpacity: 0.4//opacity from 0.0 to 1.0
        });
        overlays.push(circle);
      /*} else {
        var circle = new google.maps.Circle({
              center: point,
              radius: position_dict.accuracy,
              map: map,
              fillColor: "#555555",
              fillOpacity: 0.1, //opacity from 0.0 to 1.0,
              strokeColor: "#888888",//stroke color,
              strokeOpacity: 0.4//opacity from 0.0 to 1.0
        });
        overlays.push(circle);
        // draw black circle*/
      }
    }

  });


  //var i =  - 1; 
  //if (i > -1) {
  //  GEvent.trigger(gmarkers[i],"click");
  //}
  //else {
  //  map.closeInfoWindow();
  //}
}

function plotMap() {
  onSuccess = function(data) {

      mapdata = data;

      // ==== first part of the select box ===
      var select_html = '<select onChange="handleSelected(this)">' +
                        '<option selected> - Render accuracy / hotspots - <\/option>';
      // =====================================

      

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

          hotspots_sample = position_dict.ssids;

          var i;
          for (i = 0; i < hotspots_sample.length; i++) {
              if ($.inArray(hotspots_sample[i].BSSID, all_hotspots) == -1) { // Not yet in all_hotspots array
                  all_hotspots.push(hotspots_sample[i].BSSID)
              }
          }


          point = new google.maps.LatLng(position_dict.latitude, position_dict.longitude);
          //points.push(point);

          var marker = new google.maps.Marker({
              icon: bcircle,
              position: point,
              map: map,
              title:"Hello World!"
          });

          overlays.push(marker);

          var infowindow = new google.maps.InfoWindow({
              content: JSON.stringify(position_dict)
          });

          google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map,marker);
          });

          var circle = new google.maps.Circle({
              center: point,
              radius: position_dict.accuracy,
              map: map,
              fillColor: "#0000AA",
              fillOpacity: 0.1, //opacity from 0.0 to 1.0,
              strokeColor: "#000088",//stroke color,
              strokeOpacity: 0.4//opacity from 0.0 to 1.0
          });

          overlays.push(circle);

          // Extend bound for centering
          bounds.extend(marker.position);

      });

      // Center map on markers
      map.fitBounds(bounds);

      // Populate Select Dropdown
      var i;
      for (i = 0; i < all_hotspots.length; i++) {
          select_html += '<option> ' + all_hotspots[i] + '<\/option>';
      }
      select_html += '<\/select>';
      document.getElementById("selection").innerHTML = select_html;

      



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
