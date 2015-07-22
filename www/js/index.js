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

var settings = {
    geolocation: {
        maximumAge: 60,
        timeout: 5,
        enableHighAccuracy: true
    }
};

var geolocation = {
    watchId: null,
    onSuccess: function (position) {
        geolocation.last_position = position;
        geolocation.position_list.push(position);
        console.log(position);
    },
    onError: function (error) {
        console.log(error);
    },
    last_position: null,
    position_list: []
};

var dataStore = {
    upload: function() {
    }
};

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        console.log("navigator.geolocation works well");
        geolocation.watchId = navigator.geolocation.watchPosition(
            geolocation.onSuccess,
            geolocation.onError,
            settings.geolocation
        );
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
        document.addEventListener('showData', this.showData, false);
    },
    stopCollection: function() {
        console.log('Stopping watch!');
        navigator.geolocation.clearWatch(geolocation.watchId);
    },
    showData: function() {

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    }
};

app.initialize();
