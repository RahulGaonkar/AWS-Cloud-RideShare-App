var AWS = require('aws-sdk');
var rp = require('request-promise');
var jwtDecode = require('jwt-decode');
var request = require('request');

exports.handler = async (event) => {
    var access_token = ''+ event.access_token;
    var sessionIdInfo = jwtDecode(access_token);
    console.log('sessionIdInfo',sessionIdInfo);

    var options = {
    	headers: {
			'Authorization': 'Bearer ' + access_token,
			'Content-Type': 'application/x-www-form-urlencoded'
		  },
	    method: 'POST',
	    uri: 'https://rideshare.auth.us-east-1.amazoncognito.com/oauth2/userInfo',
	    json: true // Automatically stringifies the body to JSON
	};

    return await rp(options)
    .then(data => {
    	console.log(data);
    	return data;
    })
    .catch(function (err) {
        // Crawling failed...
        console.log(err);
    });    
};
