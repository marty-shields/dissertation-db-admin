$(document).ready(function(){
  //vars
  var host, name, pass, db, ip;

  //get config json so we can get ip adress for restAPI
  $.getJSON('js/config.json', function (json) {
  ip = json[0].ip;
  });

//jquery for pressing the connect button
  $('#connect').click(function(){
    //set up variables from stuff entered in text boxes
    host = $('#host').val();
    name = $('#name').val();
    pass = $('#pass').val();
    db = $('#db').val();

//post callback too try to connect to database. Will tell us if pass/fail
    $.post(ip + '/connect',
    {host: host, name: name, pass: pass, db: db}, function(data){
      if (data == 'done'){alert("connect success");}
      else{alert("connect failed");}
    });
  });

//get callback too try to disconnect to database. Will tell us if pass/fail
  $('#disconnect').click(function(){
    $.get(ip + '/disconnect', function(data){
      if (data == 'done'){alert("disconnect success");}
      else{alert("disconnect failed");}
    });
  });

  //get callback too try to backup database. Will tell us if pass/fail
    $('#backup').click(function(){
      $.get(ip + '/backup', function(data){
        if (data == 'done'){alert("backup done");}
        else{alert("backup failed" + data); console.log(data);}
      });
    });

    //callback to try to get the file containing the backup
    $('#restoreBackup').click(function(){
      //window open will cause the window refresh and serve the file back
      window.open(ip + '/restoreBackup');
    });
});
