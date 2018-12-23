var mysql = require('promise-mysql');
exports.handler = async (event) => {
    var connection;
    var tableName;
    var currentRideStatus;
    if (event.type == "Driver") {
        tableName = "Driver";
    } else {
        tableName = "Rider";
    }

    return mysql.createConnection({
    	host     : 'YOUR HOST-NAME',
    	user     : 'YOUR USERNAME',
    	password : 'YOUR PASSWORD',
    	database : 'rideshare'
    })
    .then(conn=>{
    	connection = conn;
        return conn.query("select * from "+tableName+" where user_id = '"+event.user_id+"' and status = 'Approved'");
    })
    .then(result=>{
        console.log(result);
        if((result[0].destination_lat == event.current_lat) && (result[0].destination_long == event.current_long)){
            currentRideStatus = "Completed";
        }else{
            currentRideStatus = "Approved";
        }
        return connection.query("update "+tableName+" set current_lat = "+event.current_lat+", current_long = "+event.current_long+", status = '"+currentRideStatus+"' where user_id = '"+event.user_id+"' and status = 'Approved'");
    })
    .then(result=>{
        connection.end();
        return result;
    })
    .catch(error => {
    	console.log(error);
    	connection.end();
    });
};
