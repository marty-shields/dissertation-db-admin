$(document).ready(function(){
  //vars
  var ip;
  var databases;

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
          console.log(data);
          databases = data;
          var list = document.getElementById('mySQLList');
          //create the list element for the dropdown menu
          data.forEach(function(element){
            var link = document.createElement('a');
            var entry = document.createElement('li');
            link.appendChild(document.createTextNode(element.db_nickname));
            entry.setAttribute('value', element.database_ID);
            link.setAttribute('class', 'dropdown-item');
            link.setAttribute('href', 'javascript:void(0);');
            entry.setAttribute('role', 'presentation');
            entry.appendChild(link);
            list.appendChild(entry);
          })
        },
        error: function(err) {
          console.log("error");
        }
    });
  });

  $(".dropdown-menu").on('click', 'li', function(){
    //get the current value
    var selText = $(this).val();
    //set the dropdown to the current text
    $('.dropdown-toggle').text($(this).text() + ' \u00A0 ');
    $('.dropdown-toggle').append('<span class="caret"></span>');
    document.getElementById('dbID').value = selText;

    //get the form to be visible
    $('#editDb').removeClass('hidden');

    //find the correct one wusing the database id and add to the elements
    databases.forEach(function(database){
      if(selText === database.database_ID){
        document.getElementById('dbNickname').value = database.db_nickname;
        document.getElementById('dbName').value = database.db_name;
        document.getElementById('dbHostname').value = database.db_hostname;
        document.getElementById('dbUsername').value = database.db_username;
        document.getElementById('dbPassword').value = database.db_password;
      }
    });

    var editDb = $('#editDb');
      editDb.submit(function (ev) {
          $.ajax({
              type: editDb.attr('method'),
              url: ip + '/editDatabaseInfo',
              data: editDb.serialize(),
              xhrFields:{
                withCredentials:true
              },
              success: function (data) {
                alert('Database Information Changed Successfully');
                window.location.replace('settings-editdb.html');
              },
              error: function(err) {
                alert(err.responseText);
                window.location.replace('settings-editdb.html');
              }
          });

          ev.preventDefault();
      });

  });
})
