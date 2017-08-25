$(document).ready(function(){
  //vars
  var ip;

  //get config json so we can get ip adress for restAPI
  $.getJSON('js/config.json', function (json) {
  ip = json[0].ip;

    //ajax call to get the personal info
    $.ajax({
        type: "GET",
        url: ip + '/getUserInfo',
        data: 'json',
        xhrFields:{
          withCredentials:true
        },
        success: function (data) {
          var email = data[0].email;
          var fName = data[0].first_name;
          var sName = data[0].last_name;

          document.getElementById('info').innerHTML = '<br>Name: ' + fName + ' ' +
          sName + '<br>' + 'Email Address: ' + email;
        },
        error: function(err) {
          console.log("error");
        }
    });
  });
})
