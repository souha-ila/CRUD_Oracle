const express = require("express");
const app = express()
const oracledb = require('oracledb');
app.use(express.static("public/img"));
app.use(express.static("public/css"));
app.use(express.static("public/js"));
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//--------------------------Login----------------------------
let connectionProperties;
app.post('/submit', (req,res)=> {
  connectionProperties = {
    user:req.body.Username,
    password: req.body.Password,
    connectionString: "localhost/orcl",
  };
  const username = req.body.Username;
  console.log(username)
  run(connectionProperties,function(result) {
    res.render('dash.ejs',{username: username ,result: result });
  });
});

let connection;
async function run(connectionProperties,callback) {
  

  try {
    connection = await oracledb.getConnection(connectionProperties);

    console.log("Successfully connected to Oracle Database");
    connection.execute("SELECT * FROM admin.reservations",{},
    { outFormat: oracledb.OBJECT },
    function (err, result,  response) {
      if (err) {
        console.error(err.message);
        response.status(500).send("Error getting data from DB");
        return;
      }
     
      var Reservations = [];
      result.rows.forEach(function (element) {
        Reservations.push({ id: element.RESERVATION_ID, firstName: element.CUSTOMER_NAME, 
          EMAIL: element.EMAIL, PHONE_NUMBER: element.PHONE_NUMBER, 
          NUMBER_OF_PEOPLE: element.NUMBER_OF_PEOPLE, RESERVATION_DATE: element.RESERVATION_DATE, 
          SPECIAL_REQUESTS: element.SPECIAL_REQUESTS });
      }, this);
      callback(Reservations);
      
    });
  } catch (err) {
    console.error(err);
    callback([]);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}


//-------------------------------add New Reservation--------------------- 
app.post('/add', async function (request, response) {
  console.log("POST RESERVATION:");

  var body = request.body;
  
  try {
    connection =await oracledb.getConnection(connectionProperties);

    console.log("Successfully connected to Oracle Database");
    await connection.execute( "INSERT INTO RESERVATIONS (RESERVATION_ID, CUSTOMER_NAME, EMAIL, PHONE_NUMBER, NUMBER_OF_PEOPLE, RESERVATION_DATE, SPECIAL_REQUESTS)" + 
      "VALUES(RESERVATION_SEQ.nextVal, :CUSTOMER_NAME,:EMAIL,:PHONE_NUMBER,:NUMBER_OF_PEOPLE,:RESERVATION_DATE,:SPECIAL_REQUESTS)",
      { 
        CUSTOMER_NAME: body.CUSTOMER_NAME, 
        EMAIL: body.EMAIL, 
        PHONE_NUMBER: body.PHONE_NUMBER, 
        NUMBER_OF_PEOPLE: body.NUMBER_OF_PEOPLE, 
        RESERVATION_DATE: body.RESERVATION_DATE, 
        SPECIAL_REQUESTS: body.SPECIAL_REQUESTS 
      },
      { autoCommit: true }
    );
    console.log("Reservation added successfully");
    response.redirect("/add.ejs");
  } catch (err) {
    console.error(err);
    response.status(500).send("Error adding reservation");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

//-------------------------UPDate Reservation------------------------

app.post('/Edit', async function (request, response) {
  console.log("UPDATE RESERVATION:");
  
  var body = request.body;
  
  try {
  connection = await oracledb.getConnection(connectionProperties);
  console.log("Successfully connected to Oracle Database");
  await connection.execute(
  "UPDATE RESERVATIONS SET CUSTOMER_NAME=:CUSTOMER_NAME, EMAIL=:EMAIL, PHONE_NUMBER=:PHONE_NUMBER, NUMBER_OF_PEOPLE=:NUMBER_OF_PEOPLE, RESERVATION_DATE=:RESERVATION_DATE, SPECIAL_REQUESTS=:SPECIAL_REQUESTS WHERE RESERVATION_ID=:RESERVATION_ID",
  {
  RESERVATION_ID: body.RESERVATION_ID,
  CUSTOMER_NAME: body.CUSTOMER_NAME,
  EMAIL: body.EMAIL,
  PHONE_NUMBER: body.PHONE_NUMBER,
  NUMBER_OF_PEOPLE: body.NUMBER_OF_PEOPLE,
  RESERVATION_DATE: body.RESERVATION_DATE,
  SPECIAL_REQUESTS: body.SPECIAL_REQUESTS,
  },
  { autoCommit: true }
  );
  console.log("Reservation updated successfully");
  response.redirect("/Edit.ejs");
  } catch (err) {
  console.error(err);
  response.status(500).send("Error updating reservation");
  } finally {
  if (connection) {
  try {
  await connection.close();
  } catch (err) {
  console.error(err);
  }
  }
  }
  });
//---------------------------DELETE------------------
app.post('/del', async function(request, response) {
  console.log("Delete RESERVATION:");

  var body = request.body;
  RESERVATION_ID= body.RESERVATION_ID
  try {
    connection =await oracledb.getConnection(connectionProperties);

    console.log("Successfully connected to Oracle Database");
    await connection.execute( "DELETE FROM RESERVATIONS WHERE RESERVATION_ID=:RESERVATION_ID",
   {
    RESERVATION_ID:RESERVATION_ID
   },
   { autoCommit: true }
 );
    console.log(" Deleted successfully");
    response.redirect("/delete.ejs");
  } catch (err) {
    console.error(err);
    response.status(500).send("Error");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});



app.get('/add.ejs', function(req, res) {

    res.render("add.ejs")
    });
    app.get('/Edit.ejs', function(req, res) {

      res.render("Edit.ejs")
      });
app.get('/', function(req, res) {

  res.render("index.ejs")
});
app.get('/login', function(req, res) {

  res.render("login.ejs")
  });
  app.get('/dash', function(req, res) {

    res.render("dash.ejs")
    });
    app.get('/delete.ejs', function(req, res) {

      res.render("delete.ejs")
      });
    
    app.listen(3000, () => {
    console.log("Server is Running")
    })