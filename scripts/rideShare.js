var map;
var sourceLocationLat;
var sourceLocationLong;
var destinationAddressGeoCodedValue;
var markers = [];
var directions = [];
$('#menu').load("menu.html");

function getSourceLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getPosition);
  } else {
    console.log("Geolocation is not supported by this browser");
  }
}

function getPosition(position) {
  //document.getElementById("header").innerHTML = "WELCOME";
  document.getElementById("userID").innerHTML = "";
  document.getElementById("distance").innerHTML = "";
  document.getElementById("avgRating").innerHTML = "";
  document.getElementById('getUserID').innerHTML = "";
  document.getElementById('getDistance').innerHTML = "";
  document.getElementById('getAvgRating').innerHTML = "";
  $("#sendRequest").hide();
  $("#button-div").hide();
  sourceLocationLat = position.coords.latitude;
  sourceLocationLong = position.coords.longitude;
  drawSourceMarker();
}

function drawSourceMarker() {
  var geocoder = new google.maps.Geocoder();
  var sourcePoint = new google.maps.LatLng(parseFloat(sourceLocationLat),parseFloat(sourceLocationLong));
  geocoder.geocode({'location': sourcePoint}, function(results, status) {
    if (status == 'OK') {
      if (results[0]) {
        map.setZoom(11);
        var marker = new google.maps.Marker({
          position: sourcePoint,
          map: map,
          title: 'Source Location',
          icon: {
            url: "images/sourcepoint.png",
            scaledSize: new google.maps.Size(55, 55)
          }
        });
        if(!markers[localStorage.user_id]) {
          markers[localStorage.user_id] = {};
        }
        markers[localStorage.user_id]["Source"] = marker;
        document.getElementById('source').value = results[0].formatted_address;
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.730610, lng: -73.935242},
    zoom: 10
  });
  getSourceLocation();
}

function calculateRoute(flag){
  //document.getElementById("header").innerHTML = "WELCOME";
  document.getElementById("userID").innerHTML = "";
  document.getElementById("distance").innerHTML = "";
  document.getElementById("avgRating").innerHTML = "";
  document.getElementById('getUserID').innerHTML = "";
  document.getElementById('getDistance').innerHTML = "";
  document.getElementById('getAvgRating').innerHTML = "";
  $("#sendRequest").hide();
  $("#button-div").hide();
  removeDirections();
  removeMarkers();
  drawSourceMarker();
  var destinationAddress = document.getElementById('destination').value;
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ 'address': destinationAddress}, function(results, status) {
    if (status == 'OK') {
      //destinationAddressGeoCodedValue = results[0].geometry.location;
      destinationAddressGeoCodedValue = results[0].geometry;
      var marker = new google.maps.Marker({
        position: results[0].geometry.location,
        map: map,
        title: 'Destination Location'
      });
      markers[localStorage.user_id]["Destination"] = marker;
      var directionsService = new google.maps.DirectionsService;
      var directionsDisplay = new google.maps.DirectionsRenderer;
      directionsDisplay.setMap(map);
      directionsDisplay.setOptions( { suppressMarkers: true } );
      directionsService.route({
           origin: {lat: sourceLocationLat, lng:sourceLocationLong},
           destination: results[0].geometry.location,
           travelMode: 'DRIVING'
         }, function(response, status) {
           if (status === 'OK') {
             directionsDisplay.setDirections(response);
             directions[localStorage.user_id] = directionsDisplay;
           } else {
             window.alert('Directions request failed due to ' + status);
           }
         });
      if (flag) {
        postRouteDetails();
      }
      nearByRides();
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function nearByRides() {
  let postdata = {
    "source_lat": sourceLocationLat.toString(),
    "source_long": sourceLocationLong.toString(),
    "destination_lat": destinationAddressGeoCodedValue.location.lat().toString(),
    "destination_long": destinationAddressGeoCodedValue.location.lng().toString(),
    "type": localStorage.type,
    "user_id":localStorage.user_id
  }
  $.ajax({ url : 'https://3c4ppt4wai.execute-api.us-east-1.amazonaws.com/prod',
    method : 'POST',
    data: JSON.stringify(postdata),
    dataType: "json",
    processData: true,
    success: response => {
               console.log(response);
               if((response != null) && (response.length !=0)){
                 nearByRidesDraw(response);
               }
            },
    fail: error => {
              console.error(error)
          }
    })
     setTimeout(nearByRides, 10000);
}

function sendUpdateStatus(status) {
    var requestData ={
     "driver_id": "",
     "rider_id": "",
     "ride_status": status
    }
    if (localStorage.type == "Driver") {
        requestData.driver_id = localStorage.user_id;
        requestData.rider_id = document.getElementById('getUserID').innerHTML;
    } else {
        requestData.driver_id = document.getElementById('getUserID').innerHTML;
        requestData.rider_id = localStorage.user_id;
    }
    $.ajax({ url : 'https://7082ilmrog.execute-api.us-east-1.amazonaws.com/prod',
        method : 'POST',
        data: JSON.stringify(requestData),
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

function nearByRidesDraw(nearByRides) {
  removeNearByMarkers();
  marker_count = 0;
  nearByRides.forEach((entry) => {
    var url_string;
    if(entry.ride_status === "Pending Approval"){
      url_string =  "images/pendingApproval.png";
    }else if(entry.ride_status === "Approved") {
      url_string =  "images/Approved.png";
    }else {
      url_string =  "images/searching.png";
    }
    marker_count +=1;
    setTimeout(() => {
      var marker = new google.maps.Marker({
        position: {lat: entry.source_lat, lng: entry.source_long},
        map: map,
        title: 'Nearby Rides',
        icon: {
          url: url_string,
          scaledSize: new google.maps.Size(120, 80)
        },
        animation: google.maps.Animation.DROP
      });
      var directionsService = new google.maps.DirectionsService;
      var directionsDisplay = new google.maps.DirectionsRenderer;
      marker.addListener('click', ()=>{
        toggleBounce(marker, entry.user_id, entry.ride_status, entry.source_lat, entry.source_long, entry.destination_lat, entry.destination_long, directionsService, directionsDisplay, entry.distance, entry.avg_rating);
      });
      if(!markers[entry.user_id]){
        markers[entry.user_id] = {};
      }
      markers[entry.user_id]["Source"] = marker;
    }, marker_count*400);
  });
}

function removeMarkers() {
    console.log(markers);
    for (var entry in markers) {
      if(markers[entry]["Source"]){
        markers[entry]["Source"].setMap(null);
      }
      if(markers[entry]["Destination"]){
        markers[entry]["Destination"].setMap(null);
      }
    }
    // markers[localStorage.user_id]["Source"].setMap(map);
}

function removeMarkerAnimation() {
    console.log(markers);
    for (var entry in markers) {
      if(markers[entry]["Source"]){
        markers[entry]["Source"].setAnimation(null);
      }
      if(markers[entry]["Destination"]){
        markers[entry]["Destination"].setAnimation(null);
      }
    }
}

function removeDirections() {
  console.log(directions);
  for (var dir in directions) {
    if (directions[dir] != null) {
        directions[dir].setMap(null);
    }
  }
}

function removeNearByDestinationMarkers() {
    console.log(markers);
    for (var entry in markers) {
      if(markers[entry]["Destination"]){
        markers[entry]["Destination"].setMap(null);
      }
    }
    markers[localStorage.user_id]["Destination"].setMap(map);
}

function removeNearByMarkers() {
    removeMarkers();
    markers[localStorage.user_id]["Source"].setMap(map);
    markers[localStorage.user_id]["Destination"].setMap(map);
}

function toggleBounce(marker, user_id, ride_status, source_lat, source_long, destination_lat, destination_long, directionsService, directionsDisplay, distance, avg_rating) {
    if (marker.getAnimation() !== null) {
      calculateRoute();
    } else {
      if(localStorage.type == "Driver"){
        //document.getElementById("header").innerHTML = "Rider Details";
        document.getElementById("userID").innerHTML = "Rider ID";
        document.getElementById("distance").innerHTML = "Proximity";
        document.getElementById("avgRating").innerHTML = "Rating";
      }else{
        //document.getElementById("header").innerHTML = "Driver DETAILS";
        document.getElementById("userID").innerHTML = "Driver ID";
        document.getElementById("distance").innerHTML = "Proximity";
        document.getElementById("avgRating").innerHTML = "Rating";
      }
      document.getElementById('getUserID').innerHTML = user_id==null?"N/A":user_id;
      document.getElementById('getDistance').innerHTML = distance==null?"N/A":distance.toFixed(2)  + " miles";
      document.getElementById('getAvgRating').innerHTML = avg_rating==null?"N/A":avg_rating;
      if(ride_status == "Pending Approval"){
        $("#button-div").show();
      }else {
        $("#sendRequest").show();
      }
      removeDirections();
      removeMarkerAnimation();
      removeNearByDestinationMarkers();
      marker.setAnimation(google.maps.Animation.BOUNCE);
      directionsDisplay.setMap(map);
      directionsDisplay.setOptions( { suppressMarkers: true } );
      directionsService.route({
           origin: {lat: sourceLocationLat, lng:sourceLocationLong},
           destination: destinationAddressGeoCodedValue,
           waypoints: [{location:new google.maps.LatLng(source_lat, source_long)},
                      {location:new google.maps.LatLng(destination_lat, destination_long)}],
           travelMode: 'DRIVING'
         }, function(response, status) {
           if (status === 'OK') {
             directionsDisplay.setDirections(response);
             directions[localStorage.user_id] = directionsDisplay;
           } else {
             window.alert('Directions request failed due to ' + status);
           }
         });
      var nearByDestinationMarker = new google.maps.Marker({
        position: {lat: destination_lat, lng: destination_long},
        map: map,
        title: 'Nearby Rides',
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
          scaledSize: new google.maps.Size(45, 45)
        },
        animation: google.maps.Animation.BOUNCE
      });
      markers[user_id]["Destination"] = nearByDestinationMarker;
      var nearByDirectionsDisplay = new google.maps.DirectionsRenderer({
        polylineOptions: {
          strokeColor: "#000000"
        }
      });
      nearByDirectionsDisplay.setMap(map);
      nearByDirectionsDisplay.setOptions( { suppressMarkers: true } );
      directionsService.route({
           origin: new google.maps.LatLng(source_lat, source_long),
           destination: new google.maps.LatLng(destination_lat, destination_long),
           travelMode: 'DRIVING'
         }, function(response, status) {
           if (status === 'OK') {
             nearByDirectionsDisplay.setDirections(response);
             directions[user_id] = nearByDirectionsDisplay;
           } else {
             window.alert('Directions request failed due to ' + status);
           }
         });
    }
}

function postRouteDetails() {
  let postdata = {
    "user_id": localStorage.user_id,
    "type": localStorage.type,
    "source_lat": sourceLocationLat.toString(),
    "source_long": sourceLocationLong.toString(),
    "destination_lat": destinationAddressGeoCodedValue.location.lat().toString(),
    "destination_long": destinationAddressGeoCodedValue.location.lng().toString(),
    "current_lat": sourceLocationLat.toString(),
    "current_long": sourceLocationLong.toString()
  }
  $.ajax({
    url : 'https://1dlzk42077.execute-api.us-east-1.amazonaws.com/prod',
    method : 'POST',
    data: JSON.stringify(postdata),
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

document.getElementById('getDirection').onclick = ()=> {
  var destination = document.getElementById('destination').value;
  if(destination == "") {
    alert("Please enter valid destination");
  } else {
    calculateRoute(true);
  }
}

function rideShareStatusPoll() {
	var requestData = {
	  "type": localStorage.type,
	  "user_id": localStorage.user_id
	}
	$.ajax({ url : 'https://kgsoyvobc9.execute-api.us-east-1.amazonaws.com/prod',
		method : 'POST',
		data: JSON.stringify(requestData),
		dataType: "json",
		processData: true,
		success: response => {
		  console.log(response)
			for (var res in response) {
				localStorage[res] = response[res];
			} 
			if (response != null) {
				window.location = 'https://s3.amazonaws.com/ride-share-app/Ride.html';
			}
		},
		fail: error => {
		  console.error(error)
		}
	})
	setTimeout(rideShareStatusPoll, 10000);
}
rideShareStatusPoll();
