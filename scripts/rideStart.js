var directionsDisplay;
var map;
var currentLocationLat;
var currentLocationLong;
var driverMarkers = [];
var riderMarkers = [];
var riderPickUpFlag = 0;
$('#menu').load("menu.html");

if(localStorage.type == "Driver"){
  document.getElementById("header").innerHTML = "RIDER DETAILS";
  document.getElementById("userID").innerHTML = "RIDER ID: ";
  document.getElementById('getUserID').innerHTML = localStorage.rider_id;
  $("#view").hide();
}else{
  document.getElementById("header").innerHTML = "DRIVER DETAILS";
  document.getElementById("userID").innerHTML = "DRIVER ID: ";
  document.getElementById('getUserID').innerHTML = localStorage.driver_id;
  $("#ride").hide();
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.730610, lng: -73.935242},
    zoom: 15
  });
}

function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getPosition);
  } else {
    console.log("Geolocation is not supported by this browser");
  }
  setTimeout(getCurrentLocation, 30000);
}

function getPosition(position) {
  currentLocationLat = position.coords.latitude;
  currentLocationLong = position.coords.longitude;
  if(localStorage.type == "Driver"){
    updateCurrentLocation();
  }else {
    pollDriverCurrentLocation();
  }
}

function postCurrentLocation() {
  var currentData = {
    "user_id": localStorage.user_id,
    "type": localStorage.type,
    "current_lat": currentLocationLat,
    "current_long": currentLocationLong
  }
  $.ajax({ url : 'https://dggyqqytdg.execute-api.us-east-1.amazonaws.com/prod',
    method : 'POST',
    data: JSON.stringify(currentData),
    dataType: "json",
    processData: true,
    success: response => {
      console.log(response)
    },
    fail: error => {
      console.error(error)
    }
  })
}

function resetDirectionDisplay() {
  if (directionsDisplay != null) {
    directionsDisplay.setMap(null);
    directionsDisplay = null;
  }
  directionsDisplay = new google.maps.DirectionsRenderer;
  directionsDisplay.setMap(map);
  directionsDisplay.setOptions( { suppressMarkers: true} );
}

function updateCurrentLocation() {
  postCurrentLocation();
  riderPickUp(currentLocationLat,currentLocationLong);
  if(riderPickUpFlag){
    removeDriverMarkers();
    removeRiderMarkers();
    resetDirectionDisplay();
    var directionsService = new google.maps.DirectionsService;
    var icons = {
       start: {
         url: 'images/sourcepoint.png',
         scaledSize: new google.maps.Size(55, 55)
       },
       end: {
         url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
         scaledSize: new google.maps.Size(45, 45)
       }
    };

    directionsService.route({
       origin: new google.maps.LatLng(currentLocationLat, currentLocationLong),
       destination: new google.maps.LatLng(localStorage.rider_destination_lat, localStorage.rider_destination_long),
       travelMode: 'DRIVING'
     }, function(response, status) {
       if (status === 'OK') {
       directionsDisplay.setDirections(response);
       var leg = response.routes[ 0 ].legs[ 0 ];
       driverMarkers.push(new google.maps.Marker({
                            position: leg.start_location,
                            map: map,
                            icon: icons.start,
                            title: "Driver Location"
                          }));
       var marker = new google.maps.Marker({
                            position: leg.end_location,
                            map: map,
                            icon: icons.end,
                            title: "Rider Destination"
                          });
        isRideComplete(currentLocationLat,currentLocationLong);
       } else {
       window.alert('Directions request failed due to ' + status);
       }
     });
  }else {
    removeDriverMarkers();
    removeRiderMarkers();
    resetDirectionDisplay();
  	var directionsService = new google.maps.DirectionsService;
    var icons = {
       start: {
         url: 'images/sourcepoint.png',
         scaledSize: new google.maps.Size(55, 55)
       },
       waypoint: {
         url: 'images/searching.png',
         scaledSize: new google.maps.Size(120, 80)
       },
       end: {
         url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
         scaledSize: new google.maps.Size(45, 45)
       }
    };

  	directionsService.route({
  	   origin: new google.maps.LatLng(currentLocationLat, currentLocationLong),
  	   destination: new google.maps.LatLng(localStorage.rider_destination_lat, localStorage.rider_destination_long),
  	   waypoints: [{location:new google.maps.LatLng(localStorage.rider_source_lat, localStorage.rider_source_long)}],
  	   travelMode: 'DRIVING'
  	 }, function(response, status) {
  	   if (status === 'OK') {
  		 directionsDisplay.setDirections(response);
       var leg1 = response.routes[ 0 ].legs[ 0 ];
       driverMarkers.push(new google.maps.Marker({
                            position: leg1.start_location,
                            map: map,
                            icon: icons.start,
                            title: "Driver Location"
                          }));
       riderMarkers.push(new google.maps.Marker({
                            position: leg1.end_location,
                            map: map,
                            icon: icons.waypoint,
                            title: "Rider Location"
                          }));
       var leg2 = response.routes[ 0 ].legs[ 1 ];
       var marker = new google.maps.Marker({
                            position: leg2.end_location,
                            map: map,
                            icon: icons.end,
                            title: "Rider Destination"
                          });
  	   } else {
  		 window.alert('Directions request failed due to ' + status);
  	   }
  	 });
  }
}

Number.prototype.toRad = function() {
   return this * Math.PI / 180;
}

function riderPickUp(lat,long) {
  if(!riderPickUpFlag){
    var distLat = (parseFloat(localStorage.rider_source_lat)-lat).toRad();
    var distLong = (parseFloat(localStorage.rider_source_long)-long).toRad();
    var R = 6371;
    var a = Math.sin(distLat/2) * Math.sin(distLat/2) +
            Math.cos(lat.toRad()) * Math.cos(parseFloat(localStorage.rider_source_lat).toRad()) *
            Math.sin(distLong/2) * Math.sin(distLong/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    riderPickUpFlag = d <= 0.05 ? 1:0;
  }
}

function isRideComplete(lat,long) {
    var distLat = (parseFloat(localStorage.rider_destination_lat)-lat).toRad();
    var distLong = (parseFloat(localStorage.rider_destination_long)-long).toRad();
    var R = 6371;
    var a = Math.sin(distLat/2) * Math.sin(distLat/2) +
            Math.cos(lat.toRad()) * Math.cos(parseFloat(localStorage.rider_destination_lat).toRad()) *
            Math.sin(distLong/2) * Math.sin(distLong/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    if(d <= 0.1){
      rideComplete();
    }
}

function rideComplete(){
  let postdata = {
    "driver_id": localStorage.driver_id,
    "rider_id": localStorage.rider_id,
    "ride_status": "Completed"
  }
  $.ajax({ url : 'https://7082ilmrog.execute-api.us-east-1.amazonaws.com/prod',
    method : 'POST',
    data: JSON.stringify(postdata),
    dataType: "json",
    processData: true,
    success: response => {
          console.log(response);
          window.location.href = "https://s3.amazonaws.com/ride-share-app/rating.html";
        },
    fail: error => {
          console.error(error);
        }
  })
}

function removeDriverMarkers() {
  for (var entry in driverMarkers) {
    driverMarkers[entry].setMap(null);
  }
}

function removeRiderMarkers() {
  for (var entry in riderMarkers) {
    riderMarkers[entry].setMap(null);
  }
}

function pollDriverCurrentLocation() {
  let postdata = {
    "driver_id": localStorage.driver_id
  }
  $.ajax({ url : 'https://3oj99s3fef.execute-api.us-east-1.amazonaws.com/prod',
    method : 'POST',
    data: JSON.stringify(postdata),
    dataType: "json",
    processData: true,
    success: response => {
          console.log(response);
		  if (response) {
			updateRiderCurrentLocation(response.current_lat,response.current_long);
		  }
        },
    fail: error => {
          console.error(error);
        }
  })
}

function updateRiderCurrentLocation(driverCurrentLat,driverCurrentLong){
  postCurrentLocation();
  riderPickUp(driverCurrentLat,driverCurrentLat);
  if(riderPickUpFlag){
    removeDriverMarkers();
    removeRiderMarkers();
    resetDirectionDisplay();
    var directionsService = new google.maps.DirectionsService;
    var icons = {
       start: {
         url: 'images/searching.png',
         scaledSize: new google.maps.Size(120, 80)
       },
       end: {
         url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
         scaledSize: new google.maps.Size(45, 45)
       }
    };

    directionsService.route({
       origin: new google.maps.LatLng(driverCurrentLat, driverCurrentLong),
       destination: new google.maps.LatLng(localStorage.rider_destination_lat, localStorage.rider_destination_long),
       travelMode: 'DRIVING'
     }, function(response, status) {
       if (status === 'OK') {
       directionsDisplay.setDirections(response);
       var leg = response.routes[ 0 ].legs[ 0 ];
       driverMarkers.push(new google.maps.Marker({
                            position: leg.start_location,
                            map: map,
                            icon: icons.start,
                            title: "Driver Location"
                          }));
       var marker = new google.maps.Marker({
                            position: leg.end_location,
                            map: map,
                            icon: icons.end,
                            title: "Rider Destination"
                          });
        isRideComplete(driverCurrentLat,driverCurrentLong);
       } else {
         window.alert('Directions request failed due to ' + status);
       }
     });
  }else {
    removeDriverMarkers();
    removeRiderMarkers();
    resetDirectionDisplay();
  	var directionsService = new google.maps.DirectionsService;
    var icons = {
       start: {
         url: 'images/searching.png',
         scaledSize: new google.maps.Size(120, 80)
       },
       waypoint: {
         url: 'images/sourcepoint.png',
         scaledSize: new google.maps.Size(55, 55)
       },
       end: {
         url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
         scaledSize: new google.maps.Size(45, 45)
       }
    };

  	directionsService.route({
  	   origin: new google.maps.LatLng(driverCurrentLat,driverCurrentLong),
  	   destination: new google.maps.LatLng(localStorage.rider_destination_lat, localStorage.rider_destination_long),
  	   waypoints: [{location:new google.maps.LatLng(currentLocationLat, currentLocationLong)}],
  	   travelMode: 'DRIVING'
  	 }, function(response, status) {
  	   if (status === 'OK') {
  		 directionsDisplay.setDirections(response);
       var leg1 = response.routes[ 0 ].legs[ 0 ];
       driverMarkers.push(new google.maps.Marker({
                            position: leg1.start_location,
                            map: map,
                            icon: icons.start,
                            title: "Driver Location"
                          }));
       riderMarkers.push(new google.maps.Marker({
                            position: leg1.end_location,
                            map: map,
                            icon: icons.waypoint,
                            title: "Rider Location"
                          }));
       var leg2 = response.routes[ 0 ].legs[ 1 ];
       var marker = new google.maps.Marker({
                            position: leg2.end_location,
                            map: map,
                            icon: icons.end,
                            title: "Rider Destination"
                          });
  	   } else {
  		 window.alert('Directions request failed due to ' + status);
  	   }
  	 });
  }
}
