var mysql = require("promise-mysql");
exports.handler = async (event) => {
    var connection;
    var existingAverageRatingSqlQuery = "select * from rating where user_id = '"+event.user_id+"' and type = '"+event.type+"'";
    var insertAverageRatingSqlQuery = "insert into rating values('"+event.user_id+"','"+event.type+"',"+event.rating+", 1)";
    return mysql.createConnection({
    	host     : 'YOUR HOST-NAME',
    	user     : 'YOUR USER-NAME',
    	password : 'YOUR PASSWORD',
    	database : 'rideshare'
    })
    .then(conn=>{
        connection = conn;
        return conn.query(existingAverageRatingSqlQuery);
    })
    .then(result=>{
       if(result.length !=0){
           var new_avg_rating = ((result[0].avg_rating*result[0].no_of_raters)+Number(event.rating))/(result[0].no_of_raters+1);
           var new_no_of_raters = result[0].no_of_raters+1;
           return connection.query("update rating SET avg_rating = "+new_avg_rating+", no_of_raters = "+new_no_of_raters+" where user_id = '"+event.user_id+"' and type = '"+event.type+"'");
       }else {
            return connection.query(insertAverageRatingSqlQuery);
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
