$('#menu').load("menu.html");
if(localStorage.type == "Driver"){
  document.getElementById("feedback-text").innerHTML = "Please provide feedback for Rider "+localStorage.rider_id;
  user_id = localStorage.driver_id;
}else{
  document.getElementById("feedback-text").innerHTML = "Please provide feedback for Driver "+localStorage.driver_id;
  user_id = localStorage.rider_id;
}

$(':radio').change(function() {
  rating = this.value;
  let postdata = {
    "user_id": user_id,
    "type": localStorage.type,
    "rating": rating.toString()
  };
      $.ajax({ 
          url : 'https://77v5ydbd42.execute-api.us-east-1.amazonaws.com/prod',
          method : 'POST',
          data: JSON.stringify(postdata),
          dataType: "json",
          processData: true,
          success: response => {
              console.log(response);
              window.location.href = "https://s3.amazonaws.com/ride-share-app/index.html";
          },
          fail: error => {
              console.error(error);
          }
      })
});
