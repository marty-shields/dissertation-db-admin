//get mysql module
var mysql = require('mysql');
var connection, hostname, username, pass, dbname;

exports.connect = function(db, callback){


      var mysq = require('mysql');
        //try conenction first
        //create a connection
        conn = mysq.createConnection({
          host : db.hostname,
          user : db.username,
          password : db.pass,
          database : db.dbname
        });

        //try to connect to connection
        conn.connect(function(err, con) {
          //if there is an error tell us what it is
          if (err){
            return callback(err);
          }else{
            callback(null);
          }
        })

}


//create end point for connecting to the database and it take in the values
exports.checkChanges = function(conn, callback){
  var watcher, mysqlEventWatcher;

    var mysql_backup = function(){
      this.mysql = require('mysql');
      //event watcher
      this.MySQLEvents = require('mysql-events');
      this.mysqlEventWatcher;
      this.dsn = {};
      this.watcher;

      this.init = function(test){
          this.connection = this.mysql.createConnection({
              host : test.hostname,
              user     : test.username,
              password : test.pass,
              database : test.dbname
          });
          return test;
        }

        this.getEvents = function(db){
          //since the connection was successfull lets get the event logging started
          var me = this;

          me.dsn = {
            host : db.hostname,
            user : db.username,
            password : db.pass
          };
          //console.log(me.dsn);
          //console.log(db.dbname);

          me.mysqlEventWatcher = me.MySQLEvents(me.dsn);

          //console.log(mysqlEventWatcher);
          console.log('STARTED LISTNING ' + db.dbname);

          //set up watcher
            me.watcher = me.mysqlEventWatcher.add(db.dbname,
            function(oldRow, newRow, event){
              console.log('FOUND SOMETHING');
                //row inserted 
              if (oldRow === null) {
                //insert code goes here
                var insert = {
                  change_type : 'Insert',
                  change_info : newRow
                }
                callback(null, insert);
              }
           
               //row deleted 
              if (newRow === null) {
                //delete code goes here 
                var del = {
                  change_type : 'Delete',
                  change_info : oldRow
                }
                callback(null, del);
              }
           
               //row updated 
              if (oldRow !== null && newRow !== null) {
                //update code goes here 
                var update = {
                  change_type : 'Update',
                  old_row : oldRow,
                  new_row : newRow
                };
                callback(null, update);
              }
            }
          );
        }

      };

    var sqql = new mysql_backup;
    var db;
    db = sqql.init(conn);
    sqql.connection.connect(function (err){
      //console.log('starting to connect');
        if(err){
          console.log('error connecting to DB');
          return callback(err);
        }
        else {
          sqql.getEvents(db);
        }

    });
};

//create end point for connecting to the database and it take in the values
exports.checkForChanges = function(conn){
  return new Promise(function (resolve, reject){

    var mysql_backup = function(){
      this.mysql = require('mysql');
      //event watcher
      this.MySQLEvents = require('mysql-events');
      this.mysqlEventWatcher;
      this.dsn = {};
      this.watcher;

      this.init = function(test){
          this.connection = this.mysql.createConnection({
              host : test.hostname,
              user     : test.username,
              password : test.pass,
              database : test.dbname
          });
          return test;
        }

        this.getEvents = function(db){
          //since the connection was successfull lets get the event logging started
          var me = this;

          me.dsn = {
            host : db.hostname,
            user : db.username,
            password : db.pass
          };
          //console.log(me.dsn);
          //console.log(db.dbname);

          me.mysqlEventWatcher = me.MySQLEvents(me.dsn);

          //console.log(mysqlEventWatcher);
          console.log('STARTED LISTNING ' + db.dbname);

          //set up watcher
            me.watcher = me.mysqlEventWatcher.add(db.dbname,
            function(oldRow, newRow, event){
              console.log('FOUND SOMETHING');
                //row inserted 
              if (oldRow === null) {
                //insert code goes here
                var insert = {
                  change_type : 'Insert',
                  change_info : newRow
                }
                resolve(insert);
              }
           
               //row deleted 
              if (newRow === null) {
                //delete code goes here 
                var del = {
                  change_type : 'Delete',
                  change_info : oldRow
                }
                resolve(del);
              }
           
               //row updated 
              if (oldRow !== null && newRow !== null) {
                //update code goes here 
                var update = {
                  change_type : 'Update',
                  old_row : oldRow,
                  new_row : newRow
                };
                console.log('UPDATE');
                resolve(update);
              }
            }
          );
        }

      };

    var sqql = new mysql_backup;
    var db;
    db = sqql.init(conn);
    sqql.connection.connect(function (err){
      //console.log('starting to connect');
        if(err){
          console.log('error connecting to DB');
          reject(err);
        }
        else {
          sqql.getEvents(db);
        }

    });
  })
};

//callback to disconnect
exports.disconnect = function(callback){
  //end the connection
  try{
    connection.end(function(err){
      if (err){
        //tell us if theres an issue ending connection
        console.error('error ending conenction:' + err.stack);
        return callback(err);
      }

      //if connection ended
      console.log('connection ended...');
      callback(null, "sucess");
      mysqlEventWatcher.stop();
    });
  } catch(err){
    return callback(err);
  }
};

//callback for backing up
exports.backupConnect = function(db){
  return new Promise(function (resolve, reject){
    console.log('starting to test the connection');

    var mysq = require('mysql');
      //try conenction first
      //create a connection
      conn = mysq.createPool({
        host : db.hostname,
        user : db.username,
        password : db.pass,
        database : db.dbname
      });

      //try to connect to connection
      conn.getConnection(function(err, con) {
        //if there is an error tell us what it is
        if (err){
          return reject(err);
        }else{
          resolve();
        }
      })
    })
  };

var mysqlDump = require('mysqldump');
var ll;

//callback for backing up
exports.backup = function(db){
  //console.log('starting mysqldump');
  return new Promise(function (resolve, reject){
    var mysql_backup = function(){
      this.backup = '';
      this.mysql = require('mysql');
      this.init = function(test){
        db = test;
          this.connection = this.mysql.createConnection({
              host : test.hostname,
              user     : test.username,
              password : test.pass,
              database : test.dbname
          });

      };

      this.query = function(sql, callback) {
          this.connection.query(sql, function (error, results, fields) {
              if (error) {
                  //console.log('error with query');
              }else{
                if (results.length  > 0) {
                    callback(results);
                }
              }
          });
      };

      this.get_tables = function(callback){
        //console.log('started to get tables');
          var counter = 0;
          var me = this;
          var dbTables = [];
          this.query('SHOW TABLES',
              function(tables) {
                //console.log(tables);
                //console.log('TABLES');
                  for (table in tables){
                    //find out the name of the key first
                    for (property in tables[table]){
                      var prop = property
                    }
                    //console.log(prop);
                      counter++;
                      me.query(
                          'SHOW CREATE TABLE ' + tables[table][prop],
                          function(r){
                              for (t in r) {
                                dbTables.push(r[t].Table);
                                  //console.log(r[t]);
                                  me.backup += "DROP TABLE " + r[t].Table + ";\n\n";
                                  me.backup += r[t]["Create Table"] + ";\n\n";
                              }
                              counter--;
                              if (counter === 0){
                                  getData(dbTables);
                              }
                          }
                      )
                  }
              });
              function getData(res){
                //console.log(me.dbTables);
                res.forEach(function(x){
                  var query = "SELECT * FROM " + x;
                  //console.log(query);
                  me.connection.query(query, function (error, results, fields) {
                    if (error) throw error;
                    //console.log('The solution is: ', results);
                    var counter = results.length;
                    results.forEach(function (xx){
                      var keys = '';
                      var values = '';
                      for (var key in xx) {
                        if (xx.hasOwnProperty(key)) {
                            keys += " `"+ key +"`, ";
                            if(typeof xx[key] == 'number'){
                              values += " "+ xx[key] +", ";
                            }else{
                              values += " `"+ xx[key] +"`, ";
                            }
                        }
                      }

                      keys = keys.slice(1, (keys.length - 2));
                      values = values.slice(1, (values.length - 2));

                      me.backup += "INSERT INTO `" + x + "` (" + keys + ")" +
                      " VALUES (" + values + ");\n";

                      counter --;
                    //console.log(counter);
                      if(counter === 0){
                          me.save_backup(me.backup);
                      }
                    })
                  });
                })
              }
      };

      this.save_backup = function(backupData){
        //console.log('saving backup');
        //console.log(backupData);
        resolve(this.backup);
      }

    };

    var sqql = new mysql_backup;
    sqql.init(db);
    sqql.connection.connect(function (err){
      //console.log('starting to connect');
        if(err){
          reject();
        }
        else {sqql.get_tables(function(x){;});}

    });
  })


    /*
    var mysqlDump = require('mysqldump');
    var trycatch = require('trycatch')

    trycatch(function(){
      console.log('starting try catch');

      mysqlDump({
          host: db.hostname,
          user: db.username,
          password: db.pass,
          database: db.dbname,
          dest:'./data.sql' // destination file 
      },function(err){
        if (err){
          //tell us if theres an issue getting the data
          reject(err.stack);
        }
        else {
          //if backup done
          console.log('made backup');

          //store backupdata from file into variable
          var fs = require('fs');
          var sql = fs.readFileSync('data.sql').toString();

          console.log('sucess');
          resolve(sql);
        }
      })

    }, function (err){
      reject(err.stack);
    });
    */
};



return new Promise(function (resolve, reject){

  console.log('starting mysqldump');
  console.log(db);

  var mysqlDump = require('mysqldump');
  trycatch(function(){

    mysqlDump({
        host: db.hostname,
        user: db.username,
        password: db.pass,
        database: db.dbname,
        dest:'./data.sql' // destination file 
    },function(err){
      if (err){
        //tell us if theres an issue getting the data
        return callback(err);
      }
      else {
        //if backup done
        console.log('made backup');

        //store backupdata from file into variable
        var fs = require('fs');
        var sql = fs.readFileSync('data.sql').toString();

        console.log('sucess');
        resolve(sql);
      }
    })

  }, function (err){
    reject(err.stack);
  });


  })
