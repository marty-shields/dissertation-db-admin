$(document).ready(function(){
  //vars
  var ip;

  //get config json so we can get ip adress for restAPI
  $.getJSON('js/config.json', function (json) {
  ip = json[0].ip;
  });

    $('#logout').click(function(){
        $.ajax({
            type: 'GET',
            url: ip + '/logout',
            xhrFields:{
              withCredentials:true
            },
            success: function (data) {
              window.location.replace('index.html')
            },
            error: function(err) {
              alert(err.responseText);
            }
        });

    });
});
