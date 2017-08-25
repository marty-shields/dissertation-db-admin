$(document).ready(function(){
  //vars
  var ip;

  //get config json so we can get ip adress for restAPI
  $.getJSON('js/config.json', function (json) {
  ip = json[0].ip;
  });

  var login = $('#resetPassword');
    login.submit(function (ev) {
        $.ajax({
            type: login.attr('method'),
            url: ip + '/forgot',
            data: login.serialize(),
            xhrFields:{
              withCredentials:true
            },
            success: function (data) {
              console.log(data);
              alert('Password Email Sent');
            },
            error: function(err) {
              console.log("error");
              console.log(err);
            }
        });

        ev.preventDefault();
    });

});
