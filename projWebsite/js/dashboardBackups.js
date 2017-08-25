$(document).ready(function(){
  //vars
  var ip;
  var databases;
  var table;

  //get config json so we can get ip adress for restAPI
  $.getJSON('js/config.json', function (json) {
  ip = json[0].ip;

    //call to get all the info for changes
    $.ajax({
        type: "GET",
        url: ip + '/getBackupsInfo',
        data: 'json',
        xhrFields:{
          withCredentials:true
        },
        success: function (data) {
          databases = data;
          generateChanges(data);

        },
        error: function(err) {
          console.log("error");
        }
    });
  });
  var changes = [];
  function generateChanges(db){
    //go through the list of DBs connected and see what each type is
    db.forEach(function(element){
      var database = {
        backup_ID : element.backup_ID,
        database_ID : element.database_ID,
        db_nickname : element.db_nickname,
        backup_info : element.backup_info,
        time_stamp : element.time_stamp
      };
      changes.push(database);
    });

    //add databases to drop down by nickname
    var list = document.getElementById('mySQLList');
    var nickList = [];
    //create the list element for the dropdown menu
    changes.forEach(function(element){
      var inList = false;

      nickList.forEach(function(dbNickname){
        if(element.database_ID === dbNickname){
          inList = true;
        }
      });

      //if its not already in the list
      if(inList === false){
        var link = document.createElement('a');
        var entry = document.createElement('li');
        link.appendChild(document.createTextNode(element.db_nickname));
        entry.setAttribute('value', element.database_ID);
        link.setAttribute('class', 'dropdown-item');
        link.setAttribute('href', 'javascript:void(0);');
        entry.setAttribute('role', 'presentation');
        entry.appendChild(link);
        list.appendChild(entry);
        nickList.push(element.database_ID);
      }
    })
  }

  var dbID;
  //handle when a database is chosen
  $("#mySQLList").on('click', 'li', function(){
    //get the current value
    dbID = $(this).val();
    //set the dropdown to the current text
    $('#dbDropdown').text($(this).text() + ' \u00A0 ');
    $('#dbDropdown').append('<span class="caret"></span>');
    //document.getElementById('dbID').value = selText;
    //document.getElementById('dbTables').innerHTML = "";

    var changeList = [];
    //find the correct one wusing the database id and add to the elements
    databases.forEach(function(database){
      if(database.database_ID === dbID){
        changeList.push(database);
      }
    });

    //start to create list of elements
    var list = document.getElementById('viewChanges');
    list.innerHTML = '';
    $('#viewChanges').removeClass('hidden');

    //various elements for the table
    var table = document.createElement('table');
    table.setAttribute('class', 'table table-striped table-bordered table-hover');
    table.setAttribute('style', 'width: auto;');
    var thead = document.createElement('thead');
    var tbody = document.createElement('tbody');
    var thhead = document.createElement('th');
    var thbody = document.createElement('th');
    thbody.setAttribute('scope', 'row');
    var td = document.createElement('td');
    var trhead = document.createElement('tr');
    var button = document.createElement('button');

    //build the table heading
    thhead.appendChild(document.createTextNode('Time Stamp'));
    trhead.appendChild(thhead);
    var thhead = document.createElement('th');
    thhead.appendChild(document.createTextNode('Restore Backup'));
    trhead.appendChild(thhead);
    thead.appendChild(trhead);

    //set up the main body of the table
    changeList.forEach(function(backup){
      var trbody = document.createElement('tr');
      var td = document.createElement('td');
      td.appendChild(document.createTextNode(backup.time_stamp));
      trbody.appendChild(td);
      var td = document.createElement('td');
      var button = document.createElement('button');
      button.setAttribute('class', 'btn btn-primary btn-sm');
      button.setAttribute('type', 'button');
      button.setAttribute('onclick', 'getBackup(this)');
      trbody.setAttribute('style', 'text-align: center;');
      button.setAttribute('value', backup.backup_info);
      button.appendChild(document.createTextNode('Download'));
      td.appendChild(button);
      trbody.appendChild(td);

      //set up table elements
      tbody.appendChild(trbody);
    });

    //put heading and body into table
    table.appendChild(thead);
    table.appendChild(tbody);

    //add the heading and list to div
    list.appendChild(table);

  });
})



function getBackup(info){
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(info.value));
  element.setAttribute('download', 'data.txt');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
