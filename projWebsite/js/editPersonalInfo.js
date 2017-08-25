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

          document.getElementById('first_nameForm').value = fName;
          document.getElementById('last_nameForm').value = sName;
          document.getElementById('emailForm').value = email;
        },
        error: function(err) {
          console.log("error");
        }
    });
  });

  var register = $('#editUser');
    register.submit(function (ev) {
        $.ajax({
            type: register.attr('method'),
            url: ip + '/editUser',
            data: register.serialize(),
            xhrFields:{
              withCredentials:true
            },
            success: function (data) {
              alert('Information Changed Successfully');
              window.location.replace('profile-edit.html');
            },
            error: function(err) {
              alert(err.responseText);
              window.location.replace('profile-edit.html');
            }
        });

        ev.preventDefault();
    });
})
