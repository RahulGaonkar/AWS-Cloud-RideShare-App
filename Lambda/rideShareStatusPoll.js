var mysql = require("promise-mysql");

exports.handler = async (event) => {
    var connection;
    return mysql.createConnection({
    	host     : 'YOUR HOST NAME',
    	user     : 'YOUR USERNAME',
    	password : 'YOUR PASSWORD',
    	database : 'rideshare'
    })
    .then(conn=>{
        var columnName;
        if (event.type == "Driver") {
            columnName = "Ride_Request.driver_id";
        } else {
            columnName = "Ride_Request.rider_id";
        }
        connection = conn;
        var fetchStatusQuery = `SELECT Driver.source_lat as driver_source_lat, Driver.source_long as driver_source_long ,
            Driver.destination_lat as driver_destination_lat, Driver.destination_long as driver_destination_long,
            Rider.source_lat as rider_source_lat, Rider.source_long as rider_source_long ,
            Rider.destination_lat as rider_destination_lat, Rider.destination_long as rider_destination_long ,
            Ride_Request.driver_id as driver_id , Ride_Request.rider_id as rider_id
            FROM Ride_Request, Driver, Rider
            where
            `+columnName+` = "`+event.user_id+`" and Ride_Request.ride_status= "Approved" and
            Driver.user_id = Ride_Request.driver_id and
            Rider.user_id = Ride_Request.rider_id
            ;`;
        return connection.query(fetchStatusQuery);
    })
    .then(data=>{
        console.log(data);
        connection.end();
        return data[0];
    })
    .catch(err => {
        connection.end();
        console.log(err);
    });
};
