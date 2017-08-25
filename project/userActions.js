var sqlite;

//function to connect to the database
exports.connectToDB = function(callback){
    sqlite = require('sqlite-cipher'); //requiring 
     
    //Connecting - (databaseFile, [password], [algorithm]) 
    sqlite.connect('db/dbAdmin.enc','pass66554','aes-256-ctr');

    console.log("DATABASE INIT");
    //sqlite.run("CREATE TABLE database_info(database_ID INTEGER PRIMARY KEY AUTOINCREMENT, db_nickname TEXT NOT NULL, db_type TEXT NOT NULL, db_name TEXT NOT NULL, db_hostname TEXT NOT NULL, db_username TEXT NOT NULL, db_password TEXT NOT NULL, db_backup INTEGER NOT NULL, email TEXT NOT NULL);");
    //sqlite.run("CREATE TABLE database_changes(change_ID INTEGER PRIMARY KEY AUTOINCREMENT, database_ID INTEGER NOT NULL, change_type TEXT NOT NULL, change_info TEXT NOT NULL, change_fields TEXT NOT NULL, time_stamp TEXT NOT NULL);");
    //sqlite.run("CREATE TABLE users(student_number INTEGER, first_name TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT NOT NULL PRIMARY KEY, pass TEXT NOT NULL);");
    //console.log(sqlite.run('SELECT * FROM users'));
    return callback(null);
}

exports.getDBInfo = function(callback){
  sqlite = require('sqlite-cipher'); //requiring 
   
  //Connecting - (databaseFile, [password], [algorithm]) 
  sqlite.connect('db/dbAdmin.enc','pass66554','aes-256-ctr');

  //console.log("DATABASE INIT");

  //console.log(sqlite.run('SELECT * FROM users'));
  //console.log(sqlite.run('SELECT * FROM database_info'));
  return callback(null)
}

//function to hash a password
exports.passwordHash = function(pw, callback){
  return new Promise(function (resolve, reject){

    //hash password
    var password = require('password-hash-and-salt');
     
    // Creating hash and salt 
    password(pw).hash(function(error, hash) {
      if(error){
        throw new Error('Something went wrong!');
        return reject();
      }
        // Store hash (incl. algorithm, iterations, and salt) 
        return resolve(hash);
      })
  })
}

//verify and compare a hash
exports.verifyHash = function(enteredPw, actualPW){
  return new Promise(function (resolve, reject){
    /*
    console.log(enteredPw);
    console.log(actualPW);*/
    //hash password
    var password = require('password-hash-and-salt');

    // Verifying a hash 
        password(enteredPw).verifyAgainst(actualPW, function(error, verified) {
            if(error)
                return reject();
            if(!verified) {
                console.log("pw verify fail");
                return reject();
            } else {
                console.log("pw verify pass");
                return resolve(true);
            }
        })
      })
}

//function to hash a password
exports.addUser = function(user, callback){
  return new Promise(function (resolve, reject){
    sqlite = require('sqlite-cipher'); //requiring 
    //Connecting - (databaseFile, [password], [algorithm]) 
    sqlite.connect('db/dbAdmin.enc','pass66554','aes-256-ctr');

    //sqlite.run("CREATE TABLE users(student_number INTEGER, first_name
    //TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT NOT NULL PRIMARY KEY,
    //pass TEXT NOT NULL);");

    var rows = sqlite.run('SELECT * FROM users WHERE email = ?', [user.email]);

    //check to see if rows is empty
    function isEmpty(myObject) {
    for(var key in myObject) {
        if (myObject.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
    }

    if(isEmpty(rows)){
      //Inserting
      sqlite.insert("users", user, function(inserid){
        //console.log(inserid);
      });

      //console.log(sqlite.run("SELECT * FROM users;"));
      return resolve();
    }else{
      throw new Error('Something went wrong!');
      return Promise.reject();
    }
  })
}

//function to add database
exports.addDatabase = function(database){
  return new Promise(function (resolve, reject){
    sqlite = require('sqlite-cipher'); //requiring 
    //Connecting - (databaseFile, [password], [algorithm]) 
    sqlite.connect('db/dbAdmin.enc','pass66554','aes-256-ctr');

    //sqlite.run("CREATE TABLE database_info(database_ID INTEGER PRIMARY KEY AUTOINCREMENT, db_nickname TEXT NOT NULL, db_type TEXT NOT NULL, db_name TEXT NOT NULL, db_hostname TEXT NOT NULL, db_username TEXT NOT NULL, db_password TEXT NOT NULL, db_backup INTEGER NOT NULL, email TEXT NOT NULL);");
    //sqlite.run("DELETE * FROM database_info");
    sqlite.insert("database_info", database, function(inserid){

      //console.log('DB INFO');
      //console.log(sqlite.run('SELECT * FROM database_info'));
      resolve(inserid);
    })
  })
}

//function to add a change made to database
exports.addDatabaseChange = function(res){
  sqlite = require('sqlite-cipher'); //requiring 
  //Connecting - (databaseFile, [password], [algorithm]) 
  sqlite.connect('db/dbAdmin.enc','pass66554','aes-256-ctr');

  //sqlite.run("DROP TABLE database_changes;");
  //sqlite.run("CREATE TABLE database_changes(change_ID INTEGER PRIMARY KEY AUTOINCREMENT, database_ID INTEGER NOT NULL, change_type TEXT NOT NULL, database_table TEXT NOT NULL, change_info TEXT NOT NULL, change_fields TEXT NOT NULL, time_stamp TEXT NOT NULL);");

  //console.log(res);

  sqlite.insert("database_changes", res, function(inserid){

    //console.log('DB INFO');
    //console.log(sqlite.run('SELECT * FROM database_changes'));
  })
}

//function to backup database data for user
exports.backupDatabase = function(sql, databaseID){
      var date = new Date();
      //console.log('starting to put backup into DB');
      //connect to database first
      sqlite = require('sqlite-cipher'); //requiring 
      //Connecting - (databaseFile, [password], [algorithm]) 
      sqlite.connect('db/dbAdmin.enc','pass66554','aes-256-ctr');
      //sqlite.run("DROP TABLE backup_info")
      //sqlite.run("CREATE TABLE backup_info(backup_ID INTEGER PRIMARY KEY AUTOINCREMENT, database_ID INTEGER NOT NULL, backup_info TEXT NOT NULL, time_stamp TEXT NOT NULL);");

      var insertStatement = {
        database_ID : databaseID,
        backup_info : sql,
        time_stamp : date.toUTCString()
      }

      //console.log(insertStatement);

      sqlite.insert('backup_info', insertStatement, function(error, id){
        //console.log(error);
        //console.log(sqlite.run('SELECT * FROM backup_info'));
        //console.log('backup saved into DB');
      })
}

//function to get backup databases data incase server shuts down
exports.getDatabasesForBackup = function(){
    return new Promise(function (resolve, reject){
      //connect to database first
      sqlite = require('sqlite-cipher'); //requiring 
      //Connecting - (databaseFile, [password], [algorithm]) 
      sqlite.connect('db/dbAdmin.enc','pass66554','aes-256-ctr');


      //console.log(rows);
      var dbIDS = [];

      //if its unique get the database time schedule and add to array
      sqlite.run('SELECT * FROM database_info;', function(res){

        if (res.error){
          console.log('ERROR');
          reject(res);
        }else{
          res.forEach(function(row){
            var result = {
              hostname : row.db_hostname,
              username : row.db_username,
              pass : row.db_password,
              dbname : row.db_name,
              dbID : row.database_ID,
              dbBackup : row.db_backup
            }

            dbIDS.push(result);
          })

          resolve(dbIDS);
        }
      });
    })
  }
