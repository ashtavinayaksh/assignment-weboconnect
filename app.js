const express = require('express');
const mysql = require('mysql2');
// const multer = require('multer');
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const port = 3000; 

// db connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'assignment',
  });
  
  // Connect to the MySQL database
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    console.log('Connected to MySQL database');
  });

app.use(express.json());
app.use('/api', require('./routes/route'));
// const upload = multer({ dest: 'uploads/' });

app.listen(port, ()=>{
    console.log(`server listening on port ${port}`);
})