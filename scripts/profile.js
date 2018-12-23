var cognitoData = {
	"access_token": localStorage.access_token
}

$('#menu').load("menu.html");

$.ajax({
  url : 'https://6c6pq8ga88.execute-api.us-east-1.amazonaws.com/prod',
	method : 'POST',
	data: JSON.stringify(cognitoData),
	dataType: "json",
	processData: true,
	success: response => {
		console.log(response);
		if (!response) {
			window.location = 'https://rideshare.auth.us-east-1.amazoncognito.com/login/?response_type=token&client_id=8ebpfkg69mkm1v7od1njh2j30&redirect_uri=https://s3.amazonaws.com/ride-share-app/DriverOrRider.html';
		} else {
			document.getElementById("header").innerHTML = localStorage.type + " Profile Details";
      document.getElementById("username").innerHTML = response.username;
      document.getElementById("email").innerHTML = response.email;
		}
	},
	fail: error => {
		console.error(error)
	}
})
