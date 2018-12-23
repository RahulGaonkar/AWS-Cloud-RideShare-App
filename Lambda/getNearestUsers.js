var mysql = require('promise-mysql');
var googleMapsClient = require('@google/maps').createClient({
  key: 'YOUR API KEY',
  Promise: Promise
});

exports.handler = async (event) => {
    var connection;
    var tableName, originalParam;
    var originalDistance = 0;
    var nearByUsers;
    originalParam = {
        origin: event.source_lat + ',' + event.source_long ,
        destination: event.destination_lat + ',' + event.destination_long ,
    };
    googleMapsClient.directions(originalParam).asPromise()
    .then((response) => {
        if (response) {
             for (var leg of response.json.routes[0].legs) {
                originalDistance = originalDistance + leg.distance.value;
            }
        }
     })
    .catch(error => {
    	console.log(error);
    	connection.end();
    });

    if (event.type == "Driver") {
        tableName = "Rider";
    } else {
        tableName = "Driver";
    }

    return await mysql.createConnection({
    	host     : 'YOUR HOST NAME',
    	user     : 'YOUR USERNAME',
    	password : 'YOUR PASSWORD',
    	database : 'rideshare'
    }).then(function(conn){
    	connection = conn;
        var result = conn.query('CALL nearest_cordinates('+event.source_lat+', '+event.source_long+', "'+tableName+'")');
        return result;
    }).then(function(rows){
    	var promises = [];
    	nearByUsers = rows[0];
    	console.log(nearByUsers);
    	for (var row of rows[0]) {
    	    var param;
    	     if (event.type == "Driver") {
                param = {
                    origin: event.source_lat + ',' + event.source_long ,
                    destination: event.destination_lat + ',' + event.destination_long ,
                    waypoints: row.source_lat + ',' + row.source_long + '|' + row.destination_lat + ',' + row.destination_long
                };
            } else {
                param = {
                    origin: row.source_lat + ',' + row.source_long  ,
                    destination: row.destination_lat + ',' + row.destination_long ,
                    waypoints: event.source_lat + ',' + event.source_long + '|' + event.destination_lat + ',' + event.destination_long
                };
            }
        	var promise = googleMapsClient.directions(param).asPromise();
        	promises.push(promise);
    	}
    	return Promise.all(promises);
    })
    .then((response) => {
        var finalUsers = [];
        //console.log(response[2].json.routes[0].legs)
        for (var nearByUser in response) {
            var newDistance = 0;
            var legs= response[nearByUser].json.routes[0].legs;
            for (var legindex in legs) {
                var leg = legs[legindex];
                newDistance = newDistance + leg.distance.value;
            }
            var diff = newDistance - originalDistance;
            console.log("diff", diff);
            if (Math.abs(diff) < 5000) {
                finalUsers.push(nearByUsers[nearByUser]);
            }
        }
        connection.end();
        return finalUsers;
     })
    .catch(error => {
    	console.log(error);
    	connection.end();
    });
};
