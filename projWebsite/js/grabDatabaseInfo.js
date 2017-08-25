$(document).ready(function(){
  //vars
  var ip;

  //get config json so we can get ip adress for restAPI
  $.getJSON('js/config.json', function (json) {
  ip = json[0].ip;

    //ajax call to get the personal info
    $.ajax({
        type: "GET",
        url: ip + '/getDatabaseInfo',
        data: 'json',
        xhrFields:{
          withCredentials:true
        },
        success: function (data) {
          console.log(data)
          var href = window.location.href;

          console.log(window.location.href);

          document.getElementById('databasesConnected').innerHTML = '<br>Total ' +
          'databases connected is: ' + data.length;
        },
        error: function(err) {
          console.log("error");
        }
    });
  });
})
