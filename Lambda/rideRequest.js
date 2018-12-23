var mysql = require("promise-mysql");
exports.handler = async (event) => {
    var rideStatus = ["Searching","Approved","Completed"];
    var rideRequestStatus = ["Pending Approval","Approved","Completed"];
    var connection;
    var previousRideRequestStatus;
    if(event.ride_status == "Declined"){
        previousRideRequestStatus = rideRequestStatus.indexOf("Approved")-1;
    }else {
        previousRideRequestStatus = rideRequestStatus.indexOf(event.ride_status)-1;
    }
    previousRideRequestStatus = (previousRideRequestStatus == -1) ? 0 : previousRideRequestStatus;
    var driverUpdateSqlQuery = "update Driver SET status = '"+event.ride_status+"' where user_id = '"+event.driver_id+"' and status = '"+rideStatus[previousRideRequestStatus]+"'";
    var riderUpdateSqlQuery = "update Rider SET status = '"+event.ride_status+"' where user_id = '"+event.rider_id+"' and status = '"+rideStatus[previousRideRequestStatus]+"'";
    var rideRequestExistSqlQuery = "select * from Ride_Request where driver_id = '"+event.driver_id+"' and rider_id = '"+event.rider_id+"' and ride_status = '"+rideRequestStatus[previousRideRequestStatus]+"'";
    var rideRequestInsertSqlQuery = "insert into Ride_Request values('"+event.driver_id+"','"+event.rider_id+"','"+event.ride_status+"', CURRENT_TIMESTAMP())";
    var rideRequestUpdateSqlQuery = "update Ride_Request SET ride_status = '"+event.ride_status+"' where driver_id = '"+event.driver_id+"' and rider_id = '"+event.rider_id+"' and ride_status = '"+rideRequestStatus[previousRideRequestStatus]+"'";
    return mysql.createConnection({
    	host     : 'YOUR HOST-NAME',
    	user     : 'YOUR USERNAME',
    	password : 'YOUR PASSWORD',
    	database : 'rideshare'
    })
    .then(conn=>{
        connection = conn;
        if((event.ride_status != "Pending Approval") && (event.ride_status != "Declined")){
            return connection.query(driverUpdateSqlQuery);
        }
        return null;
    })
   .then(result=>{
       if((event.ride_status != "Pending Approval") && (event.ride_status != "Declined")){
            return connection.query(riderUpdateSqlQuery);
       }
       return null;
    })
   .then(result=>{
        return connection.query(rideRequestExistSqlQuery);
    })
   .then(result=>{
       console.log(result);
        if(result.length != 0){
            return connection.query(rideRequestUpdateSqlQuery);
        }else{
            return connection.query(rideRequestInsertSqlQuery);
        }
    })
    .then(result=>{
        connection.end();
    })
    .catch(error => {
    	console.log(error);
    	connection.end();
    });
};
