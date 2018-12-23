var mysql = require("promise-mysql");
exports.handler = async (event) => {
    var connection;
    var tableName;
    var pendingRideRequest;
    var updatePendingRideRequest;
    if (event.type == "Driver") {
        tableName = "Driver";
        pendingRideRequest = "select * from Ride_Request where driver_id = '"+event.user_id+"' and ride_status = 'Pending Approval'";
        updatePendingRideRequest = "update Ride_Request SET ride_status = 'Declined' where driver_id = '"+event.user_id+"' and ride_status = 'Pending Approval'";
    } else {
        tableName = "Rider";
        pendingRideRequest = "select * from Ride_Request where rider_id = '"+event.user_id+"' and ride_status = 'Pending Approval'";
        updatePendingRideRequest = "update Ride_Request SET ride_status = 'Declined' where rider_id = '"+event.user_id+"' and ride_status = 'Pending Approval'";
    }

    var insertRouteSqlQuery = "insert into " + tableName + " values('"+event.user_id+"',"+event.source_lat+","+ event.source_long+","+ event.destination_lat+","+event.destination_long+","+event.current_lat+","+event.current_long+",'Searching',CURRENT_TIMESTAMP())";
    var routeExistSqlQuery = "select * from " + tableName + " where user_id = '"+event.user_id+"' and source_lat = "+event.source_lat+" and source_long = "+event.source_long+" and destination_lat = "+event.destination_lat+" and destination_long = "+event.destination_long+" and current_lat = "+event.current_lat+" and current_long = "+event.current_long+" and status = 'Searching'";
    var deleteRouteSqlQuery = "delete from " + tableName + " where user_id = '"+event.user_id+"' and source_lat = "+event.source_lat+" and source_long = "+event.source_long+" and destination_lat = "+event.destination_lat+" and destination_long = "+event.destination_long+" and current_lat = "+event.current_lat+" and current_long = "+event.current_long+" and status = 'Searching'";
    return mysql.createConnection({
    	host     : 'YOUR HOST-NAME',
    	user     : 'YOUR USERNAME',
    	password : 'YOUR PASSWORD',
    	database : 'rideshare'
    })
    .then(conn=>{
        connection = conn;
        return conn.query(routeExistSqlQuery);
    })
    .then(result=>{
       if(result.length > 0){
            return connection.query(deleteRouteSqlQuery);
       } else {
          return null;
       }
    })
    .then(result=>{
        return connection.query(insertRouteSqlQuery);
    })
    .then(result=>{
        return connection.query(pendingRideRequest);
    })
    .then(result=>{
       if(result.length !=0){
            return connection.query(updatePendingRideRequest);
       }
       return null;
    })
    .then(result=>{
        connection.end();
    })
    .catch(error => {
    	console.log(error);
    	connection.end();
    });
};
