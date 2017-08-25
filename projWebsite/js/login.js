$(document).ready(function(){
  //vars
  var ip;

  //get config json so we can get ip adress for restAPI
  $.getJSON('js/config.json', function (json) {
  ip = json[0].ip;
  });

  var login = $('#login');
    login.submit(function (ev) {
        $.ajax({
            type: login.attr('method'),
            url: ip + '/login',
            data: login.serialize(),
            xhrFields:{
              withCredentials:true
            },
            success: function (data) {
              window.location.replace('dashboard.html')
            },
            error: function(err) {
              console.log("error");
              alert('Login Failed');
            }
        });

        ev.preventDefault();
    });

    var register = $('#register');
      register.submit(function (ev) {
          $.ajax({
              type: register.attr('method'),
              url: ip + '/registerUser',
              data: register.serialize(),
              success: function (data) {
                console.log(data);
                if (data == 'done'){
                  alert("register success");
                  window.location.href = "./index.html";
                }
                else{
                  alert(data);
                  window.location.href = "./register.html";
                }
              }
          });

          ev.preventDefault();
      });


});
