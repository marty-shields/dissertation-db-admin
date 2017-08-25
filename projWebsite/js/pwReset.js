$(document).ready(function(){
  //vars
  var ip;

  //get config json so we can get ip adress for restAPI
  $.getJSON('js/config.json', function (json) {
  ip = json[0].ip;
  });

  var register = $('#resetPw');
    register.submit(function (ev) {
      if(document.getElementById('passwordForm').value !=
      document.getElementById('passwordConfirmForm').value){
          alert('Passwords are not the same');
          window.location.replace('profile-reset.html');
      }else{

        $.ajax({
            type: register.attr('method'),
            url: ip + '/resetPw',
            data: register.serialize(),
            xhrFields:{
              withCredentials:true
            },
            success: function (data) {
              alert('Password Changed Successfully');
              window.location.replace('profile.html');
            },
            error: function(err) {
              console.log("error");
              alert('Password Change Failed');
              window.location.replace('profile-reset.html');
            }
        });

      }
        ev.preventDefault();
    });
})
