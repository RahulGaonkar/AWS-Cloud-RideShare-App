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
        connection = conn;
        return connection.query("select current_lat,current_long from Driver where status = 'Approved' and user_id = '"+event.driver_id+"'");
    })
    .then(data=>{
        connection.end();
        console.log(data);
        return data[0];
    })
    .catch(err => {
        connection.end();
        console.log(err);
    });
};
