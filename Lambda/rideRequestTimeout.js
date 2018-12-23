var mysql = require('promise-mysql');
exports.handler = async (event) => {
    var connection;
    var timeoutDriverRideRequest = [];
    var timeoutRiderRideRequest = [];
    var timeoutDriverRideRequestPromise1 = [];
    var timeoutRiderRideRequestPromise1 = [];
    var timeoutDriverRideRequestPromise2 = [];
    var timeoutRiderRideRequestPromise2 = [];
    var selectTimeoutDriverRideRequest = "select * from Driver where TIMESTAMPDIFF(MINUTE,timestamp,CURRENT_TIMESTAMP()) >=30";
    var selectTimeoutRiderRideRequest = "select * from Rider where TIMESTAMPDIFF(MINUTE,timestamp,CURRENT_TIMESTAMP()) >=30";

    return mysql.createConnection({
    	host     : 'YOUR HOST NAME',
    	user     : 'YOUR USERNAME',
    	password : 'YOUR PASSWORD',
    	database : 'rideshare'
    })
    .then(conn=>{
    	connection = conn;
        return connection.query(selectTimeoutDriverRideRequest);
    })
    .then(result =>{
        if(result.length !=0) {
        	Object.keys(result).forEach((key) => {
                timeoutDriverRideRequest.push(result[key]);
            });
        }
    	return connection.query(selectTimeoutRiderRideRequest);
    })
    .then(result =>{
        if(result.length !=0) {
        	Object.keys(result).forEach((key) => {
                timeoutRiderRideRequest.push(result[key]);
            });
        }
        if(timeoutDriverRideRequest.length !=0) {
            timeoutDriverRideRequest.forEach((element) => {
                timeoutDriverRideRequestPromise1.push(connection.query("delete from Driver where user_id = '"+element.user_id+"' and status = 'Searching'"));
            });
            return Promise.all(timeoutDriverRideRequestPromise1);
        }
        return null;
    })
    .then(result=>{
        if(timeoutRiderRideRequest.length !=0) {
            timeoutRiderRideRequest.forEach((element) => {
                timeoutRiderRideRequestPromise1.push(connection.query("delete from Rider where user_id = '"+element.user_id+"' and status = 'Searching'"));
            });
            return Promise.all(timeoutRiderRideRequestPromise1);
        }
        return null;
    })
    .then(result=>{
        if(timeoutDriverRideRequest.length !=0) {
            timeoutDriverRideRequest.forEach((element) => {
                timeoutDriverRideRequestPromise2.push(connection.query("update Ride_Request SET ride_status = 'Declined' where driver_id = '"+element.user_id+"' and ride_status = 'Pending Approval'"));
            });
            return Promise.all(timeoutDriverRideRequestPromise2);
        }
        return null;
    })
    .then(result=>{
        if(timeoutRiderRideRequest.length !=0) {
            timeoutRiderRideRequest.forEach((element) => {
                timeoutRiderRideRequestPromise2.push(connection.query("update Ride_Request SET ride_status = 'Declined' where rider_id = '"+element.user_id+"' and ride_status = 'Pending Approval'"));
            });
            return Promise.all(timeoutRiderRideRequestPromise2);
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
