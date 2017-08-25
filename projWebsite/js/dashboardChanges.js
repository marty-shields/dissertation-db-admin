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
        url: ip + '/getChangesInfo',
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
        change_type : element.change_type,
        database_ID : element.database_ID,
        db_nickname : element.db_nickname,
        database_table : element.database_table,
        change_info : JSON.parse(element.change_info),
        change_fields : JSON.parse(element.change_fields)
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
    document.getElementById('dbTables').innerHTML = "";
    //sort out the texts for the dropdown for tables
    var list = document.getElementById('dbTables');
    var tableList = [];

    changes.forEach(function(element){
      if(dbID === element.database_ID){
        var inList = false;
          tableList.forEach(function(table){
            if(element.database_table === table){
              inList = true;
            }
          });

          //if its not already in the list
          if(inList === false){
            var link = document.createElement('a');
            var entry = document.createElement('li');
            link.appendChild(document.createTextNode(element.database_table));
            entry.setAttribute('value', element.database_table);
            link.setAttribute('class', 'dropdown-item');
            link.setAttribute('href', 'javascript:void(0);');
            entry.setAttribute('role', 'presentation');
            entry.appendChild(link);
            list.appendChild(entry);
            tableList.push(element.database_table);
          }
        }
      });

    //get the form to be visible
    $('#change').removeClass('hidden');

  });

  //handle when a database is chosen
  $("#dbTables").on('click', 'li', function(){
    //get the current value
    table = $(this).attr("value");
    //set the dropdown to the current text
    $('#dbTableDropdown').text($(this).text() + ' \u00A0 ');
    $('#dbTableDropdown').append('<span class="caret"></span>');

    //get the form to be visible
    $('#changes').removeClass('hidden');

  });


  //handle when change type is chosen
  $("#cT").on('click', 'li', function(){
    //get the current value
    var changeType = $(this).attr("value");

    //set the dropdown to the current text
    $('#changeDropdown').text($(this).text() + ' \u00A0 ');
    $('#changeDropdown').append('<span class="caret"></span>');
    //document.getElementById('dbID').value = selText;


    $('#viewChanges').removeClass('hidden');

    var changeList = [];
    //find the correct one wusing the database id and add to the elements
    databases.forEach(function(database){
      if(database.database_ID === dbID){
        if(changeType === "All"){
          changeList.push(database);
        }else{
          if(changeType === database.change_type){
            changeList.push(database);
          }
        }
      }
    });
    var chosenTable = table;

    //start to create list of elements
    var list = document.getElementById('viewChanges');
    $("#viewChanges").text('');

    changeList.forEach(function(change){
      //if its update we have to treat the table as different
      if(change.change_type === 'Update'){

        //various elements for the table
          var table = document.createElement('table');
          table.setAttribute('class', 'table table-striped table-bordered table-hover');
          var thead = document.createElement('thead');
          var tbody = document.createElement('tbody');
          var thhead = document.createElement('th');
          var thbody = document.createElement('th');
          thbody.setAttribute('scope', 'row');
          var td = document.createElement('td');
          var trhead = document.createElement('tr');
          var trbody = document.createElement('tr');

          var h4 = document.createElement('h3');
          var br = document.createElement('br');

          var fields = JSON.parse(change.change_fields);
          var old_row = JSON.parse(fields.old_row);
          var new_row = JSON.parse(fields.new_row);

          //need to set the table depending on what type of change made
          var h4 = document.createElement('h4');
          var h3 = document.createElement('h3');
          //set up time stamp first and change type first
          h3.appendChild(document.createTextNode(change.time_stamp));
          h4.appendChild(document.createTextNode(change.change_type));
          list.appendChild(h3);
          list.appendChild(h4);

          thhead.appendChild(document.createTextNode('Database Columns'));
          thhead.setAttribute('style', 'text-align: right;');
          trhead.appendChild(thhead);

          thbody.appendChild(document.createTextNode('Old Row'));
          thbody.setAttribute('style', 'text-align: right;');
          trbody.appendChild(thbody);

          //set up key values for what changes have been made
          $.each(old_row, function(k, v) {
            var thhead = document.createElement('th');
            thhead.appendChild(document.createTextNode(k));
            trhead.appendChild(thhead);
            var td = document.createElement('td');
            td.appendChild(document.createTextNode(v));
            trbody.appendChild(td);
            //set up table elements
            thead.appendChild(trhead);
            tbody.appendChild(trbody);
          });

          var trbody = document.createElement('tr');
          var thbody = document.createElement('th');
          var td = document.createElement('td');
          thbody.appendChild(document.createTextNode('New Row'));
          thbody.setAttribute('style', 'text-align: right;');
          trbody.appendChild(thbody);

          //set up key values for the new row
          $.each(new_row, function(k, v) {
            var td = document.createElement('td');
            td.appendChild(document.createTextNode(v));
            trbody.appendChild(td);
            tbody.appendChild(trbody);
          });

          //put heading and body into table
          table.appendChild(thead);
          table.appendChild(tbody);

          //add the heading and list to div
          list.appendChild(h4);
          list.appendChild(table);

          list.appendChild(br);


      }else{
        if(change.database_table === chosenTable){
        //various elements for the table
          var table = document.createElement('table');
          table.setAttribute('class', 'table table-striped table-bordered table-hover');
          var thead = document.createElement('thead');
          var tbody = document.createElement('tbody');
          var thhead = document.createElement('th');
          var thbody = document.createElement('th');
          thbody.setAttribute('scope', 'row');
          var td = document.createElement('td');
          var trhead = document.createElement('tr');
          var trbody = document.createElement('tr');

          var h4 = document.createElement('h3');
          var br = document.createElement('br');

          console.log(change);
          console.log(change.change_fields);
          var fields = JSON.parse(change.change_fields);

          //need to set the table depending on what type of change made
          var h4 = document.createElement('h4');
          var h3 = document.createElement('h3');
          //set up time stamp first and change type first
          h3.appendChild(document.createTextNode(change.time_stamp));
          h4.appendChild(document.createTextNode(change.change_type));
          list.appendChild(h3);
          list.appendChild(h4);

          thhead.appendChild(document.createTextNode('Database Columns'));
          thhead.setAttribute('style', 'text-align: right;');
          trhead.appendChild(thhead);

          thbody.appendChild(document.createTextNode('Row ' + change.change_type));
          thbody.setAttribute('style', 'text-align: right;');
          trbody.appendChild(thbody);


          //set up key values for what changes have been made
          $.each(fields, function(k, v) {
            var thhead = document.createElement('th');
            thhead.appendChild(document.createTextNode(k));
            trhead.appendChild(thhead);
            var td = document.createElement('td');
            td.appendChild(document.createTextNode(v));
            trbody.appendChild(td);
          });

          //set up table elements
          thead.appendChild(trhead);
          tbody.appendChild(trbody);

          //put heading and body into table
          table.appendChild(thead);
          table.appendChild(tbody);

          //add the heading and list to div
          list.appendChild(h4);
          list.appendChild(table);

          list.appendChild(br);
        }
      }
    });

  });

})
