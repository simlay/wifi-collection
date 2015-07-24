/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var settings = {//{{{
    geolocation: {
        maximumAge: 60,
        timeout: 5,
        enableHighAccuracy: true
    },
    ssid: {
        //maximumAge: 60,
        timeout: 5*1000,
    },
    upload: {
        url: 'http://127.0.0.1:5984/location/',
        http_timeout: 60,
        sample_timout: 1000*60*5,
        username:'',
        password:''
    },
    show: {
      displayTimout: 3*1000,
      uploadTimout: 60*5*1000
    }
};//}}}

var ssid = {//{{{
    watchId: null,
    last_ssid_query: null,
    ssid_query_list: [],
    onSuccess: function (ssid_data) {
        console.log(ssid_data);
        ssid.last_ssid_query = ssid_data;
        ssid.ssid_query_list.push(ssid_data);
    },
    onError: function (error) {
        console.log(error);
    },
    start: function() {
      ssid.watchId = window.setInterval(
          function () {
              WifiWizard.getScanResults(ssid.onSuccess, ssid.onError);
          },
          settings.ssid.timeout
      );

    }
};//}}}

var geolocation = {//{{{
    watchId: null,
    onSuccess: function (position) {
        var position_dict = {
            time: position.timestamp,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
        };
        geolocation.last_position = position_dict;
        geolocation.position_list.push(position_dict);
        console.log(position_dict);
    },
    onError: function (error) {
        console.log(error);
    },
    last_position: null,
    position_list: [],
    start: function() {
        geolocation.watchId = navigator.geolocation.watchPosition(
            geolocation.onSuccess,
            geolocation.onError,
            settings.geolocation
        );
    },
    stop: function () {
        navigator.geolocation.clearWatch(geolocation.watchId);
    }
};//}}}

var dataStore = {//{{{
    upload: function() {
      xmlhttp = new XMLHttpRequest();
      xmlhttp.open(
          'POST',
          settings.upload.url,
          false
          // settings.upload.username,
          // settings.password.password
      );

    },
    show: function() {
        document.getElementById('lastSample').innerText = JSON.stringify(geolocation.last_position) + JSON.stringify(ssid.last_ssid_query);
    },
    start: function() {
      dataStore.showId = window.setInterval(
          dataStore.show,
          settings.show.displayTimout
      );
      //dataStore.uploadId = window.setTimeout(dataStore.show, settings.show.uploadTimout);
    }
};//}}}

var app = {//{{{
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        geolocation.start();
        ssid.start();
        dataStore.start();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        // Upload button.
        document.addEventListener('upload', dataStore.upload, false);
        // Stop sampling button.
        document.addEventListener('stopCollection', this.stopCollection, false);
        document.addEventListener('showData', dataStore.show, false);
    },
    stopCollection: function() {
        console.log('Stopping watch!');
        geolocation.stop();
    },
};//}}}

app.initialize();
