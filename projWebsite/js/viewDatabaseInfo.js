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
          document.getElementById('databasesConnected').innerHTML = '<br>Total ' +
          'databases connected is: ' + data.length;


          var list = document.getElementById('databaseInfo');
          var ul = document.createElement('ul');
          //create the list element for the dropdown menu
          data.forEach(function(element){

            var heading = document.createElement('h3');
            heading.appendChild(document.createTextNode('Nickname: ' + element.db_nickname));

            var entry = document.createElement('li');
            entry.appendChild(document.createTextNode('Database Name: ' + element.db_name));

            var entry2 = document.createElement('li');
            entry2.appendChild(document.createTextNode('Database Hostname: ' + element.db_hostname));

            var entry3 = document.createElement('li');
            entry3.appendChild(document.createTextNode('Username: ' + element.db_username));

            var entry4 = document.createElement('li');
            entry4.appendChild(document.createTextNode('Password: ' + element.db_password));

            var entry5 = document.createElement('li');
            entry5.appendChild(document.createTextNode('Backup Schedule: Once Every ' + element.db_backup + ' Hours'));

            list.appendChild(heading);
            list.appendChild(ul);
            list.appendChild(entry);
            list.appendChild(entry2);
            list.appendChild(entry3);
            list.appendChild(entry4);
            list.appendChild(entry5);
          })
        },
        error: function(err) {
          console.log("error");
        }
    });
  });

})
