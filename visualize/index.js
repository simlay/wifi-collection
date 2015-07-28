var all_hotspots = [];
var points = [];

var circles = [];
var markers = [];

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
  while (markers[0]){
    markers.pop().setMap(null);
  }
  while (circles[0]){
    circles.pop().setMap(null);
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

      markers.push(marker);

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
      circles.push(circle);
    });
  }

  $.each(mapdata.rows, function(key, row) {
    position_dict = row.doc;
    hotspots_sample = position_dict.ssids;

    point = new google.maps.LatLng(position_dict.latitude, position_dict.longitude);

    var i;
    for (i = 0; i < hotspots_sample.length; i++) {
      if (hotspots_sample[i].BSSID == selected_hotspot.BSSID) { // Not yet in all_hotspots array

        var marker = new google.maps.Marker({
          icon: bcircle,
          position: point,
          map: map,
          title:"Hello World!"
        });

        markers.push(marker);

        var infowindow = new google.maps.InfoWindow({
            content: JSON.stringify(hotspots_sample[i])
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);
        });

        var circle = new google.maps.Circle({
            center: point,
            //radius: position_dict.accuracy,
            //radius: Math.pow(10,-hotspots_sample[i].level/20)/600,
            _level: hotspots_sample[i].level,
            _freq: hotspots_sample[i].frequency,

            radius: Math.pow(10,-hotspots_sample[i].level/20)/600,
            map: map,
            fillColor: "#550000",
            fillOpacity: 0.05, //opacity from 0.0 to 1.0,
            strokeColor: "#880000",//stroke color,
            strokeOpacity: 0.2//opacity from 0.0 to 1.0
        });

        circles.push(circle);
      }
    }

  });

}

var debug = false;

var constant = 600;


window.onload = function() {

  gui = new dat.GUI();

  gui.add(this, 'debug').name("Debug");  

  gui.add(this, 'constant').name("Constant").onChange(function(newValue) {

    var i;
    for (i = 0; i < circles.length; i++) {
      var k =  constant;//40;//-27.55; // 32.44;
      var exp = (-10 -circles[i]._level - k - 20*Math.log10(circles[i]._freq) ) / 20;
      var dist = Math.pow(10, exp);
      circles[i].setRadius(dist *1);
      //circles[i].setRadius(constant*1000*Math.pow(10,circles[i]._level/20));
    }
    //  )

  });
};




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
              var all_hotspots_BSSIDs = $.map(all_hotspots, function(val) {return val.BSSID});
              if ($.inArray(hotspots_sample[i].BSSID, all_hotspots_BSSIDs) == -1) { // Not yet in all_hotspots array
                  all_hotspots.push({"BSSID": hotspots_sample[i].BSSID, "SSID": hotspots_sample[i].SSID})
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

          markers.push(marker);

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

          circles.push(circle);

          // Extend bound for centering
          bounds.extend(marker.position);

      });

      // Center map on markers
      map.fitBounds(bounds);

      // Populate Select Dropdown
      var i;
      for (i = 0; i < all_hotspots.length; i++) {

          if (all_hotspots[i].BSSID == "c8:b3:73:4f:50:1a") {
            select_html += ('<option>' + all_hotspots[i].SSID + ' (COOL DATA!) <\/option>');
          } else {

            select_html += '<option> ' + all_hotspots[i].SSID + '<\/option>';
          }
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
