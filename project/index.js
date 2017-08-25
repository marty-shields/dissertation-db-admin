//create cron for scheduling every min
var cron = require('node-cron');
//create express require
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var session = require('express-session');
var cookieParser = require('cookie-parser');
var sanitizer = require('sanitizer');
const fs = require('fs');
var validator = require('validator');

//Here we are configuring express to use body-parser as middle-ware.
var cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  resave: false,
  secret: 'sdlfjljrowuroweu',
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: false
  }
}));

//setting up password reset
var forgot = require('password-reset')({
    uri : 'http://localhost:8080/password_reset',
    from : 'password-robot@localhost',
    host : 'localhost', port : 25,
});
app.use(forgot.middleware);

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    // Pass to next layer of middleware
    next();
});

//#region LOGIN SCRIPTS//

function checkAuth(req, res, next) {
  if (!req.session.user) {
    res.status(400).send('error');
  } else {
    next();
  }
}

app.get('/loginPass', checkAuth, function (req, res) {
    res.send('if you are viewing this page it means you are logged in');
});

var userActions = require('./userActions.js');
sqlite = require('sqlite-cipher'); //requiring 

//register endpoint to login
console.log("registered endpoint /login");
app.post('/login', function (req, res){
  function handleResult(err, result) {
    if (err) {
      console.log("issues connecting to DB");
    }else{
      console.log("started login");
      //sanitization for escaping striping tags/attributes
      req.body.user = sanitizer.escape(req.body.user);
      req.body.user = sanitizer.sanitize(req.body.user);
      req.body.pass = sanitizer.escape(req.body.pass);
      req.body.pass = sanitizer.sanitize(req.body.pass);

      req.body.user = encodeURI(req.body.user);
      req.body.pass = encodeURIComponent(req.body.pass);

      console.log(req.body.user);
      console.log(req.body.pass);

      //make sure email is a valid email address
      if(!validator.isEmail(req.body.user)){
        console.log('email faulty');
        res.status(400).send('error');
      }else{
        //query for login details
        console.log(sqlite.run("SELECT * FROM users WHERE email = ?",
        [req.body.user]));
        var rows = sqlite.run("SELECT * FROM users WHERE email = ?",
        [req.body.user]);

        if(rows.length == 0){
          console.log('empty');
          // Closing connection  
          sqlite.close();
          res.status(400).send('error');
        }else{
          // Closing connection  
          sqlite.close();
          //run a promise which first verifies the hash and then brings back true
          // or false depending on result of verification
          userActions.verifyHash(req.body.pass, rows[0].pass).then(function(result){
            //result will be bringing back true or false and we check for this
            var verifyPassword = result;
            if(verifyPassword){
              req.session.user = req.body.user;
              req.session.save();
              res.send('success');
            }else{
              res.status(400).send('error');
            }
          }).catch(function(){
            //error with the hash password verificaiton process
            console.log("error with hash etc");
            res.status(400).send('error');
          })
        }
      }
    }
  };
  //connect to database
  userActions.connectToDB(handleResult);
});

//register endpoint to logout
console.log("registered endpoint /logout");
app.get('/logout', function (req, res){
  req.session.destroy(function(err){
    if(err){
        res.status(400).send('Error : Unable to Logout');
    }
    else  {
        res.send('success');
    }
});
})

//register endpoint for password reset
console.log("registered endpoint /forgot");
app.post('/forgot', function (req, res) {
  console.log('started pw reset');
    var email = req.body.email;
    var reset = forgot(email, function (err) {
        if (err) res.end('Error sending message: ' + err)
        else res.end('Check your inbox for a password reset message.')
    });

    reset.on('request', function (req_, res_) {
        req_.session.reset = { email : email, id : reset.id };
        fs.createReadStream(__dirname + '/forgot.html').pipe(res_);
    });
});

console.log("registered endpoint /reset");
app.post('/reset', function (req, res) {
    if (!req.session.reset) return res.end('reset token not set');

    var password = req.body.password;
    var confirm = req.body.confirm;
    if (password !== confirm) return res.end('passwords do not match');

    // update the user db here

    forgot.expire(req.session.reset.id);
    delete req.session.reset;
    res.end('password reset');
});

//register endpoint to get user information
console.log('registered endpoint /getUserInfo');
app.get('/getUserInfo', function(req, res){
  function handleResult(err, result) {
    if (err) {
      console.log("issues connecting to DB");
    }else{
      console.log("DB CONNECTED get user info");

      //query for login details
      var rows = sqlite.run("SELECT first_name, last_name, email FROM users WHERE email = ?",
      [req.session.user]);
      sqlite.close();
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(rows));
    }
  }
  //connect to database
  userActions.connectToDB(handleResult);
});

//register endpoint to get database information
console.log('registered endpoint /getDatabaseInfo');
app.get('/getDatabaseInfo', function(req, res){
  function handleResult(err, result){
    if (err){
      console.log('issues getting DB info');
    }else{

      var query = "SELECT database_info.database_ID, database_info.db_type, database_info.db_nickname, " +
      "database_info.db_name, database_info.db_hostname, " +
      "database_info.db_username, database_info.db_password, database_info.db_backup " +
      "FROM database_info INNER JOIN users ON database_info.email = users.email " +
      "WHERE database_info.email = '" + req.session.user + "';";

      var rows = sqlite.run(query);

      sqlite.close();
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(rows));

    }
  }
  //connect to database
  userActions.getDBInfo(handleResult);
})

//register endpoint to get database information
console.log('registered endpoint /getChangesInfo');
app.get('/getChangesInfo', function(req, res){
  function handleResult(err, result){
    if (err){
      console.log('issues getting DB info');
    }else{
      var query = "SELECT database_changes.change_type, database_changes.database_table, database_info.database_ID, " +
      "database_info.db_nickname, database_changes.change_info, " +
      "database_changes.change_fields, database_changes.time_stamp FROM database_changes " +
      "INNER JOIN database_info ON database_info.database_ID = database_changes.database_ID " +
      "WHERE database_info.email = '" + req.session.user + "'" +
      "ORDER BY database_changes.change_ID DESC;";

      var rows = sqlite.run(query);
      //console.log(rows);

      sqlite.close();
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(rows));

    }
  }
  //connect to database
  userActions.getDBInfo(handleResult);
})

//register endpoint to get database information
console.log('registered endpoint /getBackupsInfo');
app.get('/getBackupsInfo', function(req, res){
  function handleResult(err, result){
    if (err){
      console.log('issues getting DB info');
    }else{
      var query = "SELECT backup_info.backup_ID, backup_info.backup_info, backup_info.time_stamp, " +
      "database_info.database_ID, database_info.db_nickname FROM backup_info " +
      "INNER JOIN database_info ON database_info.database_ID = backup_info.database_ID " +
      "WHERE database_info.email = '" + req.session.user + "'" +
      "ORDER BY backup_info.backup_ID DESC;";

      var rows = sqlite.run(query);
      //console.log(rows);

      sqlite.close();
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(rows));

    }
  }
  //connect to database
  userActions.getDBInfo(handleResult);
})

//register endpoint to remove saved database
console.log('registered endpoint /removeDatabase');
app.post('/removeDatabase', function(req, res){
  function handleResult(err, result){
    if (err){
      console.log('issues getting DB info');
    }else{

      //if we can connect santise what we get
      req.body.dbID = sanitizer.escape(req.body.dbID);
      req.body.dbID = sanitizer.sanitize(req.body.dbID);

      //make sure its not empty
      if(req.body.dbID){
        //remove the record from the database
        sqlite.run('DELETE FROM database_info WHERE database_ID = ' + req.body.dbID);
        sqlite.close();
        restartBackups();
        res.send('success');
      }else{
        res.status(400).send('Error : Unable To Remove Database');
      }

    }
  }
  //connect to database
  userActions.getDBInfo(handleResult);
})

//register endpoint to get user information
console.log('registered endpoint /editDatabaseInfo');
app.post('/editDatabaseInfo', function(req, res){
  function handleResult(err, result) {
    if (err) {
      console.log("issues connecting to DB");
    }else{
      console.log("DB CONNECTED edit db info info");

      //sanitize incoming variables make sure they are safe
      req.body.dbID = sanitizer.escape(req.body.dbID);
      req.body.dbID = sanitizer.sanitize(req.body.dbID);
      req.body.dbNickname = sanitizer.escape(req.body.dbNickname);
      req.body.dbNickname = sanitizer.sanitize(req.body.dbNickname);
      req.body.dbType = sanitizer.escape(req.body.dbType);
      req.body.dbType = sanitizer.sanitize(req.body.dbType);
      req.body.dbName = sanitizer.escape(req.body.dbName);
      req.body.dbName = sanitizer.sanitize(req.body.dbName);
      req.body.dbHostname = sanitizer.escape(req.body.dbHostname);
      req.body.dbHostname = sanitizer.sanitize(req.body.dbHostname);
      req.body.dbUsername = sanitizer.escape(req.body.dbUsername);
      req.body.dbUsername = sanitizer.sanitize(req.body.dbUsername);
      req.body.dbPassword = sanitizer.escape(req.body.dbPassword);
      req.body.dbPassword = sanitizer.sanitize(req.body.dbPassword);

      //check all fields are filled first
      if(req.body.dbID && req.body.dbNickname && req.body.dbType && req.body.dbName
      && req.body.dbHostname && req.body.dbUsername && req.body.dbPassword){

        //check to make sure none of the characters contains specials characters
        if(req.body.dbNickname.length < encodeURIComponent(req.body.dbNickname).length ||
          req.body.dbName.length < encodeURIComponent(req.body.dbName).length ||
          req.body.dbHostname.length < encodeURIComponent(req.body.dbHostname).length ||
          req.body.dbUsername.length < encodeURIComponent(req.body.dbUsername).length ||
          req.body.dbPassword.length < encodeURIComponent(req.body.dbPassword).length){
            console.log('Error: Please Do Not Use Special Characters');
            res.status(400).send('Error: Please Do Not Use Special Characters');
          }else {
            //if all fields are filled in then update the database
            updateDatabase();
          }
      }else{
        res.status(400).send('Error : Please Fill In All Fields');
      }
    }
  }

  //connect to database
  userActions.connectToDB(handleResult);

  //function to update database
  function updateDatabase(){
    sqlite.update('database_info', {
      db_nickname: req.body.dbNickname,
      db_type: req.body.dbType,
      db_name: req.body.dbName,
      db_hostname: req.body.dbHostname,
      db_username: req.body.dbUsername,
      db_password: req.body.dbPassword},
        {database_ID: req.body.dbID}, function(resp){
          if(res[0] == 'error'){
            sqlite.close();
            console.log('error');
            res.status(400).send('Error: Unable To Edit User Please Try Again Later');
          }else{
            sqlite.close();
            console.log('success');
            restartBackups();
            res.send('success');
          }
        });
  }
});

//register endpoint to get user information
console.log('registered endpoint /editUser');
app.post('/editUser', function(req, res){
  function handleResult(err, result) {
    if (err) {
      console.log("issues connecting to DB");
    }else{
      console.log("DB CONNECTED edit user info");

      //sanitize incoming variables make sure they are safe
      req.body.email = sanitizer.escape(req.body.email);
      req.body.email = sanitizer.sanitize(req.body.email);
      req.body.first_name = sanitizer.escape(req.body.first_name);
      req.body.first_name = sanitizer.sanitize(req.body.first_name);
      req.body.last_name = sanitizer.escape(req.body.last_name);
      req.body.last_name = sanitizer.sanitize(req.body.last_name);

      //check to makesure the fields are filled in
      if(req.body.email && req.body.first_name && req.body.last_name){

        //make sure email is a valid email address
        if(!validator.isEmail(req.body.email)){
          console.log('Error: Please Enter A Valid Email Address');
          res.status(400).send('Error: Please Enter A Valid Email Address');
        }else{
          //console.log(req.body.forname);
          //console.log(encodeURIComponent(req.body.forname));

          //check to make sure none of the characters contains specials characters
          if(req.body.first_name.length < encodeURIComponent(req.body.first_name).length ||
            req.body.last_name.length < encodeURIComponent(req.body.last_name).length ||
            req.body.email.length < encodeURI(req.body.email).length){
              console.log('Error: Please Do Not Use Special Characters');
              res.status(400).send('Error: Please Do Not Use Special Characters');
          }else {
            //see if the email address is the same
            if(req.session.user === req.body.email){
              updateUser();
            }else{
              //make sure email is not already in the database
              var rows = sqlite.run('SELECT * FROM users WHERE email = ?', [req.body.email]);

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
                console.log('its empty');
                updateUser();
              }else{
                console.log('not empty');
                res.status(400).send('Error : Email Address Already Taken');
              }
            }
          }
        }
      }else{
        res.status(400).send('Error : Please Fill In All Fields');
      }
    }
  }
  //connect to database
  userActions.connectToDB(handleResult);

  //function to update user
  function updateUser(){
    sqlite.update('users', {first_name: req.body.first_name,
      last_name: req.body.last_name,email: req.body.email},
        {email: req.session.user}, function(resp){
          if(res[0] == 'error'){
            sqlite.close();
            console.log('error');
            res.status(400).send('Error: Unable To Edit User Please Try Again Later');
          }else{
            sqlite.close();
            console.log('success');
            req.session.user = req.body.email;
            req.session.save();
            res.send('success');
          }
        });
  }
});

//register endpoint to get user information
console.log('registered endpoint /resetPW');
app.post('/resetPw', function(req, res){
  function handleResult(err, result) {
    if (err) {
      console.log("issues connecting to DB");
    }else{
      console.log("DB CONNECTED edit user info");

      req.body.password = sanitizer.escape(req.body.password);
      req.body.password = sanitizer.sanitize(req.body.password);

      //check to make sure none of the characters contains specials characters
      if(req.body.password.length < encodeURIComponent(req.body.password).length){
          console.log('fields not filled in');
          res.status(400)('Error: Please Do Not Use Special Characters');
        }else{
          //hash password first
          //hash the password first and use promis e to wait for it
          userActions.passwordHash(req.body.password).then(function(result){
            console.log(result);

            //now password is hashed we can put it in the datebase
            sqlite.update('users', {pass: result},
                {email: req.session.user}, function(resp){
                  //console.log(resp);
                  if(res[0] == 'error'){
                    sqlite.close();
                    console.log('error');
                    console.log(resp);
                    res.status(400).send('error');
                  }else{
                    sqlite.close();
                    console.log('success');
                    res.send('success');
                  }
                });

          }).catch(function(){
            //error with the hash password verificaiton process
            console.log("error with hash etc");
            res.end('error');
          })
        }
    }
  }
  //connect to database
  userActions.connectToDB(handleResult);
});

//register endpoint to registerUser
console.log("registered endpoint /registerUser");
app.post('/registerUser', function (req, res){
    //find out what infor has come across
    //console.log(req.body);

    //making sure all fields are filled in and student number is a number
    if(req.body.pass && req.body.studentNum && req.body.forname
    && req.body.surname && req.body.user){
      if(isNaN(req.body.studentNum)){
        res.end('Error: Please Enter A Valid Student Number');
      }else{
        req.body.pass = sanitizer.escape(req.body.pass);
        req.body.pass = sanitizer.sanitize(req.body.pass);
        req.body.studentNum = sanitizer.escape(req.body.studentNum);
        req.body.studentNum = sanitizer.sanitize(req.body.studentNum);
        req.body.forname = sanitizer.escape(req.body.forname);
        req.body.forname = sanitizer.sanitize(req.body.forname);
        req.body.surname = sanitizer.escape(req.body.surname);
        req.body.surname = sanitizer.sanitize(req.body.surname);
        req.body.user = sanitizer.escape(req.body.user);
        req.body.user = sanitizer.sanitize(req.body.user);

        //make sure email is a valid email address
        if(!validator.isEmail(req.body.user)){
          console.log('fields not filled in');
          res.end('Error: Please Enter A Valid Email Address');
        }

        //console.log(req.body.forname);
        //console.log(encodeURIComponent(req.body.forname));


        //check to make sure none of the characters contains specials characters
        if(req.body.pass.length < encodeURIComponent(req.body.pass).length ||
          req.body.forname.length < encodeURIComponent(req.body.forname).length ||
          req.body.surname.length < encodeURIComponent(req.body.surname).length ||
          req.body.user.length < encodeURI(req.body.user).length){
            console.log('fields not filled in');
            res.end('Error: Please Do Not Use Special Characters');
          }


        //hash the password first and use promis e to wait for it
        userActions.passwordHash(req.body.pass).then(function(result){
          //result will be bringing back hashed password
          var user = {student_number : req.body.studentNum,
          first_name : req.body.forname,
          last_name : req.body.surname,
          email : req.body.user,
          pass : result}

          //add the user with the information
          userActions.addUser(user).then(function(result){
            res.end('done');
          }).catch(function(){
            //error with the hash password verificaiton process
            console.log("error with hash etc");
            res.end('Error: Email Address Already Taken');
          })
        }).catch(function(){
          //error with the hash password verificaiton process
          console.log("error with hash etc");
          res.end('Error with system');
        })
      }
    }else{
      console.log('fields not filled in');
      res.end('Error: Please Fill In All Fields');
    }
});

//#endregion LOGIN SCRIPTS

//#region mySQL functions
//create mysql connection from the js script
var mySQLconnect = require('./mysqlConn');
//run the backups back up automatically if the server goes down
function restartBackups(){
  //start by getting all the databases that are saved back
  //and run each in the schedule backups
  userActions.getDatabasesForBackup().then(function(result){

    //attempt to set scheduled backups
    if(result.error){
      console.log('SYSTEM ERROR');
    }else{
      //for each of the databases saved send out to cron to backup
      result.forEach(function(row){
          scheduleBackup(row, row.dbBackup);
          checkDBForUpdates(row);
        })
      }
  }).catch(function(){
    //error with the hash password verificaiton process
    console.log("error with getting databases");
    console.log(result);
  })
}

restartBackups();

//this function will backup the database every so often
function scheduleBackup(database, time){
  //console.log('Start scheduleBackup');
  time = time - 1;
  var sched = '59 59 ' + time + ' * * *'

  mySQLconnect.backup(database).then(function(result){
    //take the result and save into database backup
    //console.log('backup complete');
    userActions.backupDatabase(result, database.dbID);
  }).catch(function(){
    //error with the hash password verificaiton process
    //console.log("error with attempting backup");
  })

  //cron will schedule for the amount of time set for the backup
  cron.schedule("20 * * * * *", function(){

    mySQLconnect.backup(database).then(function(result){
      //take the result and save into database backup
      //console.log('backup complete');
      userActions.backupDatabase(result, database.dbID);
    }).catch(function(){
      //error with the hash password verificaiton process
      //console.log("error with attempting backup");
    })
  }, true);
}

//this will run through the database to check for changes
function checkDBForUpdates(database){
  console.log('start scheduled check for updates');

  //setup watching the changes
  mySQLconnect.checkChanges(database, handleResult);

    function handleResult(err, result){
      if (err){
        //there is an error getting the stuff
      }else{
        //console.log(result);
        var date = new Date();
        //console.log(JSON.stringify(result.change_info.affectedColumns));
        //console.log(JSON.stringify(result.change_info.fields));

        //put change into own json to put into DB
        if (result.change_type === 'Update'){
          var affectedColumns = {
            old_row : JSON.stringify(result.old_row.affectedColumns),
            new_row : JSON.stringify(result.new_row.affectedColumns)
          }
          var changedFields = {
            old_row : JSON.stringify(result.old_row.fields),
            new_row : JSON.stringify(result.new_row.fields)
          }
          var change = {
            database_ID : database.dbID,
            change_type : result.change_type,
            database_table : result.old_row.table,
            change_info : JSON.stringify(affectedColumns),
            change_fields : JSON.stringify(changedFields),
            time_stamp : date.toUTCString()
          }
        }else{
          var change = {
            database_ID : database.dbID,
            change_type : result.change_type,
            database_table : result.change_info.table,
            change_info : JSON.stringify(result.change_info.affectedColumns),
            change_fields : JSON.stringify(result.change_info.fields),
            time_stamp : date.toUTCString()
          }
        }

        userActions.addDatabaseChange(change);
      }
    }

  //this will run through the databases to make sure we can still track for changes
  cron.schedule("00 30 11 * * *", function(){

    //setup watching the changes
    mySQLconnect.checkChanges(database, handleResult);

      function handleResult(err, result){
        if (err){
          //there is an error getting the stuff
        }else{
          var date = new Date();
          //console.log(result);
          //console.log(result);

          //put change into own json to put into DB
          if (result.change_type === 'Update'){
            var affectedColumns = {
              old_row : JSON.stringify(result.old_row.affectedColumns),
              new_row : JSON.stringify(result.new_row.affectedColumns)
            }
            var changedFields = {
              old_row : JSON.stringify(result.old_row.fields),
              new_row : JSON.stringify(result.new_row.fields)
            }
            var change = {
              database_ID : database.dbID,
              change_type : result.change_type,
              change_info : JSON.stringify(affectedColumns),
              change_fields : JSON.stringify(changedFields),
              time_stamp : date.toUTCString()
            }
          }else{
            var change = {
              database_ID : database.dbID,
              change_type : result.change_type,
              change_info : JSON.stringify(result.change_info.affectedColumns),
              change_fields : JSON.stringify(result.change_info.fields),
              time_stamp : date.toUTCString()
            }
          }

          userActions.addDatabaseChange(change);
        }
      }

    }, true);
}

//register endpoint to start connection
console.log("registered endpoint /connect");
app.post('/connect', function (req, res){
  var mySQLconnect = require('./mysqlConn');
  //make sure all fields are filled in to start
  if(req.body.dbNickname && req.body.dbType && req.body.dbName &&
    req.body.dbHostname && req.body.dbUsername && req.body.dbPassword){
     //sanitize everything
     req.body.dbNickname = sanitizer.escape(req.body.dbNickname);
     req.body.dbNickname = sanitizer.sanitize(req.body.dbNickname);
     req.body.dbType = sanitizer.escape(req.body.dbType);
     req.body.dbType = sanitizer.sanitize(req.body.dbType);
     req.body.dbName = sanitizer.escape(req.body.dbName);
     req.body.dbName = sanitizer.sanitize(req.body.dbName);
     req.body.dbHostname = sanitizer.escape(req.body.dbHostname);
     req.body.dbHostname = sanitizer.sanitize(req.body.dbHostname);
     req.body.dbUsername = sanitizer.escape(req.body.dbUsername);
     req.body.dbUsername = sanitizer.sanitize(req.body.dbUsername);
     req.body.dbPassword = sanitizer.escape(req.body.dbPassword);
     req.body.dbPassword = sanitizer.sanitize(req.body.dbPassword);
     req.body.userEmail = sanitizer.escape(req.body.userEmail);
     req.body.userEmail = sanitizer.sanitize(req.body.userEmail);

     //check to make sure none of the characters contains specials characters
     if(req.body.dbNickname.length < encodeURIComponent(req.body.dbNickname).length ||
       req.body.dbName.length < encodeURIComponent(req.body.dbName).length ||
       req.body.dbHostname.length < encodeURIComponent(req.body.dbHostname).length ||
       req.body.dbUsername.length < encodeURIComponent(req.body.dbUsername).length ||
       req.body.dbPassword.length < encodeURIComponent(req.body.dbPassword).length){
         console.log('Error: Please Do Not Use Special Characters');
         res.status(400).send('Error: Please Do Not Use Special Characters');
       }else {
         //try to connect to DB first
         var db = {
           hostname : req.body.dbHostname,
           username : req.body.dbUsername,
           pass : req.body.dbPassword,
           dbname : req.body.dbName,
         }

         //ttell the log we are starting the connection
         console.log('starting connection to database');

         function handleResult(err, result) {
           if (err) {
               // Just an example. You may want to do something with the error.
               console.error("ERROR CONN ERROR CONN");
               // You should return in this branch, since there is no result to use
               // later and that could cause an exception.
               res.status(400).send('Error : Could Not Connect To Database Please Check Information');
           }else{

             //else means the function has been complete
               //create db object
               var database = {
                 db_nickname : req.body.dbNickname,
                 db_type : req.body.dbType,
                 db_name : req.body.dbName,
                 db_hostname : req.body.dbHostname,
                 db_username : req.body.dbUsername,
                 db_password : req.body.dbPassword,
                 db_backup : 24,
                 email : req.body.userEmail
               }

               //add the database and return the database ID
               userActions.addDatabase(database).then(function(result){
                 //attempt to set scheduled backups
                 var backupDB = {
                   hostname : req.body.dbHostname,
                   username : req.body.dbUsername,
                   pass : req.body.dbPassword,
                   dbname : req.body.dbName,
                   dbID : result
                }

                 scheduleBackup(backupDB, 24);
                 checkDBForUpdates(backupDB);

                 res.end('done');
               }).catch(function(){
                 //error with the hash password verificaiton process
                 console.log("error with adding DB");
                 res.status(400).send('Error : System Error Please Try Again');
               })
           }
         };
         mySQLconnect.connect(db, handleResult);
       }
   }else{
     console.log('fields not filled in');
     res.status(400).send('Error : Please Fill In All Fields');
   }

  //object to store the connection information
  /*var obj = {
    hostname: req.body.host,
    username: req.body.name,
    pass: req.body.pass,
    dbname: req.body.db
  }

  //ttell the log we are starting the connection
  console.log('starting connection to database');

  function handleResult(err, result) {
    if (err) {
        // Just an example. You may want to do something with the error.
        console.error("ERROR CONN ERROR CONN");
        // You should return in this branch, since there is no result to use
        // later and that could cause an exception.
        res.end('fail');
        return;
    }else{
      //else means the function has been complete
      console.log("SUCCESS");
      res.end('done');
    }
  };
  mySQLconnect.connect(obj, handleResult);*/
});

//register endpoint to stop connection
console.log("registered endpoint /disconnect");
app.get('/disconnect', function(req, res){

  //ttell the log we are starting the disconnection
  console.log('starting disconnection to database');

  function handleResult(err, result) {
    if (err) {
        // Just an example. You may want to do something with the error.
        console.error("ERROR DISCON...ERROR DISCON");
        // You should return in this branch, since there is no result to use
        // later and that could cause an exception.
        res.send('fail');
        return;
    }else{
      //else means the function has been complete
      console.log("SUCCESS");
      res.send('done');
    }
  };

  mySQLconnect.disconnect(handleResult);
});

//register endpoint for backing up
console.log('registered endpoint /backup');
app.get('/backup', function(req, res){
  console.log('starting backup...');

//handle result for callback to make sure its passed or failed
  function handleResult(err, result) {
    if (err) {
        // Just an example. You may want to do something with the error.
        console.error("ERROR BACKUP...ERROR BACKUP");
        // You should return in this branch, since there is no result to use
        // later and that could cause an exception.
        res.send('fail');
        return;
    }else{
      //else means the function has been complete
      console.log("SUCCESS");
      res.send('done');
    }
  };

  mySQLconnect.backup(handleResult);
});

//register endpoint to restore the backup file
console.log('registered endpoint /restorebackup');
app.get('/restorebackup', function(req, res){
  console.log('start restore');
  //handle result from callback
  try{
    //create the file directory to put in the responce header
    var file = __dirname + '/data.sql';
    res.download(file); //res.download puts the file in responce header
  }catch(err){
    throw err;
  }

});
//#endregion mySQL functions

//set the app to listen on port 3000
var server = app.listen(3000, function(){
  console.log('server running....');
});
