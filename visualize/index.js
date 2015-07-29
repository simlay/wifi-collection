
// ===============================================================================================
// Globals
// ===============================================================================================

var all_hotspots = [];
var selected_positions = [];
var points = [];
var rects = [];

var circles = [];
var markers = [];

var mapdata;

var debug = false;
var constant = 600;

var circlesVisible = true;

var bcircle = {
  url: 'blue-circle.png',
  // This marker is 20 pixels wide by 32 pixels tall.
  size: new google.maps.Size(16, 16),
  // The origin for this image is 0,0.
  origin: new google.maps.Point(0,0),
  // The anchor for this image is the base of the flagpole at 0,32.
  anchor: new google.maps.Point(8, 8)
};


// ===============================================================================================
// Utility, standalone functions
// ===============================================================================================

function getDistanceFromLatLonInM(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d*1000.0;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

// Simple 1-d gaussian
function gaussian(mean, std, x) {
  var m = std * Math.sqrt(2 * Math.PI);
  var e = Math.exp(-Math.pow(x - mean, 2) / (2 * std*std));
  return e / m;
}




function toggleCircleVisibility() {
  circlesVisible = !circlesVisible;
  setCircleVisibility(circlesVisible);
}


function setCircleVisibility(b) {

  var i = 0;
  for (i = 0; i < circles.length; i++) {
    circles[i].setVisible(b);
  }


}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


function normalizeOpacity() {

  var max = 0;

  // Find opacity interval
  var i = 0;
  for (i = 0; i < rects.length; i++) {
    if (rects[i].fillOpacity > max) {
      max = rects[i].fillOpacity
    }
  }

  // Normalize all rectangles
  var i = 0;
  for (i = 0; i < rects.length; i++) {
    var color_cap = 0.7;
    var rgb = hslToRgb(color_cap*(1-(rects[i].fillOpacity/max)), 0.5, 0.5);
    rects[i].setOptions({
      fillOpacity: 0.5,//rects[i].fillOpacity/max
      fillColor: rgbToHex(rgb[0], rgb[1], rgb[2])
    });
  }

}



function calcTotalProb(lat, lon) {

  var totalP = 0;
  var i = 0;
  for (i = 0; i < selected_positions.length; i++) {
    
    //var point = new google.maps.LatLng(selected_positions[i].latitude, selected_positions[i].longitude);
    var distance = getDistanceFromLatLonInM(lat, lon, selected_positions[i].posdict.latitude, selected_positions[i].posdict.longitude);
    //console.log("distance: ", distance)


    var prob = gaussian(selected_positions[i].circle.radius, 10.0, distance)

    totalP += prob;// Math.exp(-distance/100);
  }
  
  
  var t = totalP;// / (0.4*selected_positions.length);
  //console.log(t);
  return t;

}


// ======= This function handles selections from the select box ====
function handleSelected(opt) {

  circlesVisible = true;
  //console.log(opt.selectedIndex - 1);

  var selected_hotspot = all_hotspots[opt.selectedIndex - 1];

  // clear map overlays
  while (markers[0]){
    markers.pop().setMap(null);
  }
  while (circles[0]){
    circles.pop().setMap(null);
  }

  // Clear selected positions
  selected_positions = [];

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

  // Hotspot selected
  else {
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

          selected_positions.push({"posdict" : position_dict, "circle": circle});

          circles.push(circle);
        }
      }

    });

    // Update colors

    var i = 0;
    for (i = 0; i < rects.length; i++) {
      var tp = calcTotalProb(rects[i].lat, rects[i].lon);
      rects[i].setOptions({
        fillOpacity: tp
        //fillColor: hslToRgb(tp, 0.5, 0.5)


      });
    }

    normalizeOpacity();
  }
}

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// ===============================================================================================
// Set up DAT.GUI
// ===============================================================================================

window.onload = function() {

  gui = new dat.GUI();

  gui.add(this, 'debug').name("Debug");  

  gui.add(this, 'constant').name("Constant").onChange(function(newValue) {

    var i;
    for (i = 0; i < circles.length; i++) {
      var k =  constant;//40;//-27.55; // 32.44;
      var exp = (-10 -circles[i]._level - k - 20*Math.log10(circles[i]._freq) ) / 20;
      var dist = Math.pow(10, exp);
      circles[i].setRadius(dist * 1);
      //circles[i].setRadius(constant*1000*Math.pow(10,circles[i]._level/20));
    }
  });

  gui.add(this, 'toggleCircleVisibility').name("Toggle Circles");

};




// ===============================================================================================
// Main program
// ===============================================================================================

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
            select_html += ('<option>' + all_hotspots[i].SSID + ' (' + all_hotspots[i].BSSID + ') COOL DATA! <\/option>');
          } else {

            select_html += '<option> ' + all_hotspots[i].SSID + ' (' + all_hotspots[i].BSSID + ') ' + '<\/option>';
          }
      }
      select_html += '<\/select>';
      document.getElementById("selection").innerHTML = select_html;

      
      // Draw grid

      

      var stepsLat = 100;
      var stepsLon = 100;

      var startLat = 45.580789;
      var startLon = -122.573943;
      var endLat = 45.578496;
      var endLon = -122.570550;

      /*
      var rectangle = new google.maps.Rectangle({
          strokeColor: '#AA0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#440000',
          fillOpacity: 0.25,
          map: map,
          bounds: new google.maps.LatLngBounds(
            new google.maps.LatLng(startLat, startLon),
            new google.maps.LatLng(endLat, endLon))
        });
      */


      var i = 0;
      for (i = 0; i < stepsLat; i++) {

        var j = 0;
        for (j = 0; j < stepsLon; j++) {

          var lat =  ((startLat + ((endLat - startLat)/stepsLat) * i) + (startLat + ((endLat - startLat)/stepsLat) * (i+1))) / 2;
          var lon = ((startLon + ((endLon - startLon)/stepsLon) * j) + (startLon + ((endLon - startLon)/stepsLon) * (j+1))) / 2;
          var opacity = getDistanceFromLatLonInM(lat, lon, 45.5798, -122.5723)/200;

          var r = new google.maps.Rectangle({
            strokeColor: '#0000FF',
            strokeOpacity: 0.0,
            strokeWeight: 2,
            fillColor: '#0000FF',
            fillOpacity: opacity,
            lat: lat,
            lon: lon,
            map: map,
            bounds: new google.maps.LatLngBounds(
              new google.maps.LatLng( startLat + ((endLat - startLat)/stepsLat) * i,
                                      startLon + ((endLon - startLon)/stepsLon) * j),
              new google.maps.LatLng( startLat + ((endLat - startLat)/stepsLat) * (i+1),
                                      startLon + ((endLon - startLon)/stepsLon) * (j+1))
              ),
            zIndex: -10
          });

          rects.push(r);
        }

      }



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
