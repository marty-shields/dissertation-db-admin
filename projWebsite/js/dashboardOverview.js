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
          generateChartDB(data);

        },
        error: function(err) {
          console.log("error");
        }
    });

    //call to get all the info for changes
    $.ajax({
        type: "GET",
        url: ip + '/getChangesInfo',
        data: 'json',
        xhrFields:{
          withCredentials:true
        },
        success: function (data) {
          generateChartChanges(data);

        },
        error: function(err) {
          console.log("error");
        }
    });
  });

  function generateChartDB(db){
    //console.log(db);
    var ctx = document.getElementById("myChart");

    //initail count for each db
    var mySQLCount = 0;
    var oracleCount = 0;
    var mongoCount = 0;

    //go through the list of DBs connected and see what each type is
    db.forEach(function(element){
      switch(element.db_type){
        case 'MySQL':
          mySQLCount += 1;
          break;
        case 'Oracle':
          oracleCount += 1;
          break;
        case 'mongoDB':
          mongoCount += 1;
          break;
        default:
          break;
      }
    });

    console.log(mySQLCount);
    console.log(oracleCount);
    console.log(mongoCount);

    var data = {
      labels: [
          "MySQL",
          "Oracle",
          "Mongo DB"
      ],
      datasets: [
          {
              data: [mySQLCount, oracleCount, mongoCount],
              backgroundColor: [
                  "#FF6384",
                  "#36A2EB",
                  "#FFCE56"
              ],
              hoverBackgroundColor: [
                  "#FF6384",
                  "#36A2EB",
                  "#FFCE56"
              ]
          }]
      };

    var myChart = new Chart(ctx, {
      type: 'pie',
      data: data,
      options: {
      }
    });
  }

  function generateChartChanges(db){
    console.log(db);
    var ctx = document.getElementById("changesChart");

    //initail count for each db
    var insert = 0;
    var del = 0;
    var update = 0;

    //go through the list of DBs connected and see what each type is
    db.forEach(function(element){
      switch(element.change_type){
        case 'Insert':
          insert += 1;
          console.log('ins');
          console.log(insert);
          break;
        case 'Delete':
          del += 1;
          console.log('del');
          console.log(del);
          break;
        case 'Update':
          update += 1;
          console.log('update');
          console.log(update);
          break;
        default:
          break;
      }
    });


    var data = {
      labels: [
          "Insert",
          "Delete",
          "Update"
      ],
      datasets: [
          {
              data: [insert, del, update],
              backgroundColor: [
                  "#FF6384",
                  "#36A2EB",
                  "#FFCE56"
              ],
              hoverBackgroundColor: [
                  "#FF6384",
                  "#36A2EB",
                  "#FFCE56"
              ]
          }]
      };

    var myChart = new Chart(ctx, {
      type: 'pie',
      data: data,
      options: {
      }
    });
  }

})
