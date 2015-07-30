
// ===============================================================================================
// Globals
// ===============================================================================================


var positions = [];

var all_hotspots = [];
var all_hotspots_names = [];

var selected_positions = [];
var points = [];
var rects = [];
var heatMapData = [];
var heatmap;

var bounds;

var circles = [];
var markers = [];
var routers = [];

var mapdata;

var debug = false;
var constant = 600;

var circlesVisible = true;
var rectsVisible = true;

var bcircle = {
  url: 'blue-circle.png',
  // This marker is 20 pixels wide by 32 pixels tall.
  size: new google.maps.Size(16, 16),
  // The origin for this image is 0,0.
  origin: new google.maps.Point(0,0),
  // The anchor for this image is the base of the flagpole at 0,32.
  anchor: new google.maps.Point(8, 8)
};

var apoint = {
  url: 'access_point_medium.png',
  // This marker is 20 pixels wide by 32 pixels tall.
  size: new google.maps.Size(64, 64),
  // The origin for this image is 0,0.
  origin: new google.maps.Point(0,0),
  // The anchor for this image is the base of the flagpole at 0,32.
  anchor: new google.maps.Point(32, 32)
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


function toggleRectVisibility() {
  rectsVisible = !rectsVisible;
  setRectVisibility(rectsVisible);
}

function setRectVisibility(b) {
  var i = 0;
  for (i = 0; i < rects.length; i++) {
    rects[i].setVisible(b);
  }
}


function toggleCircleVisibility() {
  circlesVisible = !circlesVisible;
  setCircleVisibility(circlesVisible);
}

function setCircleVisibility(b) {
  var i = 0;
  for (i = 0; i < positions.length; i++) {
    positions[i].circle.setVisible(b);
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
  var maxRectI = 0;

  // Find opacity interval
  var i = 0;
  for (i = 0; i < rects.length; i++) {
    if (rects[i].fillOpacity > max) {
      max = rects[i].fillOpacity
      maxRectI = i;
    }
  }

  // Normalize all rectangles
  var i = 0;
  for (i = 0; i < rects.length; i++) {
    var color_cap = 0.6;
    var rgb = hslToRgb(color_cap*(1-(rects[i].fillOpacity/max)), 0.5, 0.5);

    //heatMapData[i].weight = rects[i].fillOpacity/max;

    rects[i].setOptions({
      fillOpacity: 0.5,// + rects[i].fillOpacity/(2*max),//rects[i].fillOpacity/max
      fillColor: rgbToHex(rgb[0], rgb[1], rgb[2])
    });
  }

  // Add marker to most likely router location
  var marker = new google.maps.Marker({
          icon: apoint,
          position: new google.maps.LatLng(rects[maxRectI].lat, rects[maxRectI].lon),
          map: map,
          title:"Hello World!"
      });

  routers.push(marker);

  //heatmap.setMap(map); 
}



function calcTotalProb(lat, lon) {

  var totalP = 0;
  var i = 0;
  for (i = 0; i < selected_positions.length; i++) {
    
    //var point = new google.maps.LatLng(selected_positions[i].latitude, selected_positions[i].longitude);
    var distance = getDistanceFromLatLonInM(lat, lon, selected_positions[i].latitude, selected_positions[i].longitude);
    //console.log("distance: ", distance)


    var prob = gaussian(selected_positions[i].circle.radius, 10.0, distance)

    totalP += prob;// Math.exp(-distance/100);
  }
  
  
  var t = totalP;// / (0.4*selected_positions.length);
  //console.log(t);
  return t;

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



function setupRectGrid(latLonBounds) {//startLat, startLon, endLat, endLon) {

  while (rects[0]){
    rects.pop().setMap(null);
  }

  /*
  var r = new google.maps.Rectangle({
        strokeColor: '#0000FF',
        strokeOpacity: 0.0,
        strokeWeight: 2,
        fillColor: '#0000FF',
        fillOpacity: opacity,
        map: map,
        bounds: latLonBounds,
        zIndex: -10
      });

      rects.push(r);
  */

  //return; 

  var NE = latLonBounds.getNorthEast();
  var SW = latLonBounds.getSouthWest();

  var stepsLat = 100;
  var stepsLon = 100;

  var startLat = NE.lat();
  var startLon = SW.lng();

  var endLat = SW.lat();
  var endLon = NE.lng();

  console.log(startLat, startLon, endLat, endLon);

  //startLat = 45.580789;
  //startLon = -122.573943;
  //endLat = 45.578496;
  //endLon = -122.570550;


//console.log(startLat, startLon, endLat, endLon);

  console.log("dist", getDistanceFromLatLonInM(NE.G, NE.K, SW.G, SW.K));

  var i = 0;
  for (i = 0; i < stepsLat; i++) {

    var j = 0;
    for (j = 0; j < stepsLon; j++) {

      var lat =  ((startLat + ((endLat-startLat)/stepsLat) * i) + (startLat + ((endLat-startLat)/stepsLat) * (i+1))) / 2;
      var lon = ((startLon + ((endLon-startLon)/stepsLon) * j) + (startLon + ((endLon-startLon)/stepsLon) * (j+1))) / 2;
      var opacity = getDistanceFromLatLonInM(lat, lon, 45.5798, -122.5723)/200;

      var bnds = new google.maps.LatLngBounds(
          new google.maps.LatLng( (startLat + ((endLat-startLat)/stepsLat) * i),
                                  (startLon + ((endLon-startLon)/stepsLon) * j)),
          new google.maps.LatLng( (startLat + ((endLat-startLat)/stepsLat) * (i+1)),
                                  startLon + ((endLon-startLon)/stepsLon) * (j+1))
          )

      var r = new google.maps.Rectangle({
        strokeColor: '#0000FF',
        strokeOpacity: 0.0,
        strokeWeight: 2,
        fillColor: '#0000FF',
        fillOpacity: opacity,
        lat: lat,
        lon: lon,
        map: map,
        bounds: bnds,
        zIndex: -10
      });

      rects.push(r);

      //var hmpoint = {location: new google.maps.LatLng(lat, lon), weight: 0.1}
      //heatMapData.push(hmpoint);





      }

    }



    
    var i = 0;
    for (i = 0; i < rects.length; i++) {

      var tp = calcTotalProb(rects[i].lat, rects[i].lon);

      //heatMapData[i].weight = tp;

      rects[i].setOptions({
        fillOpacity: tp
        //fillColor: "#FF0000"//hslToRgb(tp, 0.5, 0.5)


      });
    }

    normalizeOpacity();
    




}

















var TILE_SIZE = 256;

//Mercator --BEGIN--
function bound(value, opt_min, opt_max) {
    if (opt_min !== null) value = Math.max(value, opt_min);
    if (opt_max !== null) value = Math.min(value, opt_max);
    return value;
}

function degreesToRadians(deg) {
    return deg * (Math.PI / 180);
}

function radiansToDegrees(rad) {
    return rad / (Math.PI / 180);
}

function MercatorProjection() {
    this.pixelOrigin_ = new google.maps.Point(TILE_SIZE / 2,
    TILE_SIZE / 2);
    this.pixelsPerLonDegree_ = TILE_SIZE / 360;
    this.pixelsPerLonRadian_ = TILE_SIZE / (2 * Math.PI);
}

MercatorProjection.prototype.fromLatLngToPoint = function (latLng,
opt_point) {
    var me = this;
    var point = opt_point || new google.maps.Point(0, 0);
    var origin = me.pixelOrigin_;

    point.x = origin.x + latLng.lng() * me.pixelsPerLonDegree_;

    // NOTE(appleton): Truncating to 0.9999 effectively limits latitude to
    // 89.189.  This is about a third of a tile past the edge of the world
    // tile.
    var siny = bound(Math.sin(degreesToRadians(latLng.lat())), - 0.9999,
    0.9999);
    point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -me.pixelsPerLonRadian_;
    return point;
};

MercatorProjection.prototype.fromPointToLatLng = function (point) {
    var me = this;
    var origin = me.pixelOrigin_;
    var lng = (point.x - origin.x) / me.pixelsPerLonDegree_;
    var latRadians = (point.y - origin.y) / -me.pixelsPerLonRadian_;
    var lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);
    return new google.maps.LatLng(lat, lng);
};

//Mercator --END--

var desiredRadiusPerPointInMeters = 5;

function getNewRadius() {
    

    var numTiles = 1 << map.getZoom();
    var center = map.getCenter();
    var moved = google.maps.geometry.spherical.computeOffset(center, 10000, 90); /*1000 meters to the right*/
    var projection = new MercatorProjection();
    var initCoord = projection.fromLatLngToPoint(center);
    var endCoord = projection.fromLatLngToPoint(moved);
    var initPoint = new google.maps.Point(
      initCoord.x * numTiles,
      initCoord.y * numTiles);
     var endPoint = new google.maps.Point(
      endCoord.x * numTiles,
      endCoord.y * numTiles);
  var pixelsPerMeter = (Math.abs(initPoint.x-endPoint.x))/10000.0;
  var totalPixelSize = Math.floor(desiredRadiusPerPointInMeters*pixelsPerMeter);
  console.log(totalPixelSize);
  return totalPixelSize;
   
}




// ======= This function handles selections from the select box ====
function handleSelected(selected_hotspot) {

  circlesVisible = true;
  //console.log(opt.selectedIndex - 1);

  //var selected_hotspot = all_hotspots[opt.selectedIndex - 1];

  // clear map overlays
  while (routers[0]){
    routers.pop().setMap(null);
  }
  while (rects[0]){
    rects.pop().setMap(null);
  }

  // Clear selected positions
  selected_positions = [];

  bounds = new google.maps.LatLngBounds();
  var max_radius = 0;

  // Render accuracy if requested
  if (selected_hotspot == "all") {
    $.each(positions, function(index, pos) {

      bounds.extend(pos.marker.position);


      hotspots_sample = pos.ssids;

      point = new google.maps.LatLng(pos.latitude, position_dict.longitude);

      pos.marker.setVisible(true);

      pos.circle.setOptions({
            radius: pos.accuracy,
            fillColor: "#000055",
            strokeColor: "#000088"
          });

      pos.circle.setVisible(true);


      if (pos.accuracy > max_radius) {
        max_radius = pos.accuracy;
      }

    });
  }

  // Hotspot selected
  else {

    // First hide everything
    $.each(positions, function(index, pos) {
      pos.marker.setVisible(false);
      pos.circle.setVisible(false);
    });

    

    // Then show the positions markers and circles related to hotspot
    $.each(positions, function(index, pos) {

      hotspots_sample = pos.ssids;
      //point = new google.maps.LatLng(position_dict.latitude, position_dict.longitude);


      var i;
      for (i = 0; i < hotspots_sample.length; i++) {
        if (hotspots_sample[i].BSSID == selected_hotspot) { // Not yet in all_hotspots array

          selected_positions.push(pos);

          bounds.extend(pos.marker.position);

          pos.marker.setVisible(true);
          pos.circle.setVisible(true);


          var radius = Math.pow(10,-hotspots_sample[i].level/20)/600;
          //console.log(pos.accuracy);
          if (radius > max_radius) {
            max_radius = radius;
          }

          pos.circle.setOptions({
            _level: hotspots_sample[i].level,
            _freq: hotspots_sample[i].frequency,

            radius: radius,
            map: map,
            fillColor: "#550000",
            strokeColor: "#880000",//stroke color,
          });

        }
      }

    });

 


    

    // Update colors

    /*
    var i = 0;
    for (i = 0; i < rects.length; i++) {

      var tp = calcTotalProb(rects[i].lat, rects[i].lon);

      heatMapData[i].weight = tp;

      rects[i].setOptions({
        fillOpacity: tp
        //fillColor: hslToRgb(tp, 0.5, 0.5)


      });
    }

    normalizeOpacity();
    */

    
  }

  
  // Extend bound based on max_accuracy (lowest accuracy)
  var pointNW = google.maps.geometry.spherical.computeOffset(bounds.getNorthEast(), max_radius, 45);//315);
  var pointSE = google.maps.geometry.spherical.computeOffset(bounds.getSouthWest(), max_radius, 225);//135);

  bounds.extend(pointNW);
  bounds.extend(pointSE);

  // Center map on markers
  map.fitBounds(bounds);
  //map.setZoom(map.getZoom()-1); 


}


// ===============================================================================================
// Set up DAT.GUI
// ===============================================================================================

function showHeatMap() {
  setupRectGrid(bounds);
}


window.onload = function() {

  gui = new dat.GUI();

  //gui.add(this, 'debug').name("Debug");  

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
  gui.add(this, 'toggleRectVisibility').name("Toggle Rect HM");
   gui.add(this, 'showHeatMap').name("Show Heatmap");
    

  $("#spinner").hide();

  // Setup JQuery Widgets

  $( "#hotspots" ).autocomplete({

      source: all_hotspots_names,

      focus: function(event, ui) {
        $(this).val(ui.item.label);
        return false;
      },

      select: function(event, ui) {
        //console.log(ui.item);
        handleSelected(ui.item.value);
        return false;
      },

      //click: function(event, ui) {
      //  $(this).focus();
      //  $(this).autocomplete( "search", " " );
      //}
  });

  $("#hotspots").click(function() {
    $( "#hotspots" ).focus();
    $( "#hotspots" ).autocomplete( "search", " " );
  })

  $("#heatmap").click(function() {
    $("#spinner").show();

    setTimeout(function () {
        showHeatMap();
        $("#spinner").hide();
    }, 2000);
    
    //$( "#hotspots" ).focus();
    //$( "#hotspots" ).autocomplete( "search", " " );
  })

  $('input').addClass("ui-corner-all");
  $('input').button();
  $( "#accordion" ).accordion();
  $( "button" ).button();
  $( "radioset" ).buttonset();

  $( "tabs" ).tabs();

  $( "dialog" ).dialog({
    autoOpen: false,
    width: 400,
    buttons: [
      {
        text: "Ok",
        click: function() {
          $( this ).dialog( "close" );
        }
      },
      {
        text: "Cancel",
        click: function() {
          $( this ).dialog( "close" );
        }
      }
    ]
  });

  // Link to open the dialog
  $( "dialog-link" ).click(function( event ) {
    $( "#dialog" ).dialog( "open" );
    event.preventDefault();
  });

  $( "datepicker" ).datepicker({
    inline: true
  });

  $( "slider" ).slider({
    range: true,
    values: [ 17, 67 ]
  });

  $( "progressbar" ).progressbar({
    value: 20
  });

  $( "spinner" ).spinner();
  $( "menu" ).menu();
  $( "tooltip" ).tooltip();
  $( "selectmenu" ).selectmenu();


  // Hover states on the static widgets
  $( "dialog-link, #icons li" ).hover(
    function() {
      $( this ).addClass( "ui-state-hover" );
    },
    function() {
      $( this ).removeClass( "ui-state-hover" );
    }
  );


  plotMap();

};




// ===============================================================================================
// Main program
// ===============================================================================================

function plotMap() {
  onSuccess = function(data) {

      mapdata = data;

      map = new google.maps.Map(document.getElementById('map-canvas'));
      bounds = new google.maps.LatLngBounds();
      
      //google.maps.event.addListener(map, 'zoom_changed', function () {
      //    heatmap.setOptions({radius:getNewRadius()});
      //});

      all_hotspots_names.push({
                    "label": "All Positions / Accuracy",
                    "value": "all"
                  });

      $.each(data.rows, function( key, row) {

          position_dict = row.doc;
          hotspots_sample = position_dict.ssids;          

          // Aggregate hotspots
          var i;
          for (i = 0; i < hotspots_sample.length; i++) {
              var all_hotspots_BSSIDs = $.map(all_hotspots, function(val) {return val.BSSID});
              if ($.inArray(hotspots_sample[i].BSSID, all_hotspots_BSSIDs) == -1) { // Not yet in all_hotspots array
                  all_hotspots.push({"BSSID": hotspots_sample[i].BSSID, "SSID": hotspots_sample[i].SSID})
                  all_hotspots_names.push({
                    "label": hotspots_sample[i].SSID + " (" + hotspots_sample[i].BSSID + ")",
                    "value": hotspots_sample[i].BSSID
                  });
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

          //markers.push(marker);

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
              fillColor: "#000055",
              fillOpacity: 0.01, //opacity from 0.0 to 1.0,
              strokeColor: "#000088",//stroke color,
              strokeOpacity: 0.05//opacity from 0.0 to 1.0
          });

          //circles.push(circle);

          position_dict.marker = marker;
          position_dict.circle = circle;

          // Extend bound for centering
          bounds.extend(point);

          positions.push(position_dict);

      });

      

      // Extend bound based on max_accuracy (lowest accuracy)
      //var pointNW = google.maps.geometry.spherical.computeOffset(bounds.getNorthEast(), 50, 45);//315);
      //var pointSE = google.maps.geometry.spherical.computeOffset(bounds.getSouthWest(), 50, 225);//135);
      // NOTE NorthEast and SouthWest are actually returning NW and SE.

      //bounds.extend(pointNW);
      //bounds.extend(pointSE);

      // Center map on markers
      map.fitBounds(bounds);

      //if (all_hotspots[i].BSSID == "c8:b3:73:4f:50:1a") {
  
      // Draw grid
      //setupRectGrid(bounds);
      //setupRectGrid(45.580789, -122.573943, 45.578496, -122.570550);
      //setupRectGrid(45.574083, -122.559098, 45.571910, -122.556671);
      
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


      

      //heatmap = new google.maps.visualization.HeatmapLayer({
      //  data: heatMapData,
      //  dissipating: true,
      //  radius: 2
      //});
      //heatmap.setMap(map);
  };

  $.getJSON('db_dump.json', onSuccess);

}
//google.maps.event.addDomListener(window, 'load', plotMap);
