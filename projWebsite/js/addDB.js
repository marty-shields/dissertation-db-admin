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

          document.getElementById('userEmail').value = email;
        },
        error: function(err) {
          console.log("error");
        }
    });
  });

  var addDb = $('#addDb');
    addDb.submit(function (ev) {
        $.ajax({
            type: addDb.attr('method'),
            url: ip + '/connect',
            data: addDb.serialize(),
            xhrFields:{
              withCredentials:true
            },
            success: function (data) {
              alert('Database Added');
              window.location.replace('settings.html');
            },
            error: function(err) {
              alert(err.responseText);
            }
        });
        ev.preventDefault();
    });

});
