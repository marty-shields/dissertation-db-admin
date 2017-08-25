//vars
var ip;

//get config json so we can get ip adress for restAPI
$.getJSON('js/config.json', function (json) {
ip = json[0].ip;

$.ajax({
    type: "GET",
    url: ip + '/loginPass',
    xhrFields:{
      withCredentials:true
    },
    success: function (data) {
    },
    error: function(err) {
      console.log("error");
      window.location.replace('index.html')
    }
});
});
