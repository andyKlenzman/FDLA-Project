import cors from "cors";
import express from "express";
import { Feed } from "feed";
import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import xml2js from "xml2js"; // https://github.com/Leonidas-from-XIV/node-xml2js
import uuid from "uuid";

//GLOBAL VARIABLES
//Database commands
let sql;

//used write and serving our ATOM file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { v4: uuidv4 } = require('uuid');

//used to read outside ATOM files, and patse into JSON to be added to our database
var parseString = xml2js.parseString;

//Create and turn on our server
let app = express();
app.use(cors());
app.use(express.json());

const server = app.listen("4000", () => {
  console.log("App is listening at http://localhost:4000");
});

const serverPath = "./atomfile/atom.xml";
const publicPath = "https://gioele.uber.space/k/fdla2023/feed1.atom";


//Connect to local database with SQLite
let db = new sqlite3.Database("./db/event.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the database.");
});

// Serves up ATOM file
app.get("/events", (req, res) => {
  //select all values from the database
  let sql = `SELECT * from events`;
  db.all(sql, [], async (err, rows) => {
    if (err) {
      throw err;
    }

    //create the information to be placed in the ATOM file
    let feed = new Feed({
      title: "Events feed",
      id: "urn:uuid:" + uuidv4(), // Generate a random UUID for feed id
      updated: new Date().toISOString(), //Set the current date as updated
      link: "https://gioele.uber.space/k/fdla2023/feed1.atom", // Set the link
    });

    //Add each database entry to that row
    rows.forEach((row) => {
      feed.addItem({
        title: row.eventTitle,
        link: row.link, //Set the event link
        id: row.id, //Use the existing id from the database
        date: row.date, //Set the date of event
        published: row.published, // Set publishing date
        updated: row.updated, // Set updateding date
        summary: row.description, // Set the description from the row
        author: [{ name: row.name }], //Set the author name
        
      });
    });

    //Write to the file, and if the write is successful, send it
    fs.writeFile(serverPath, feed.atom1(), (err) => {
      if (err) console.log(err);
      else {
        console.log("File written successfully\n");
        fs.copyFile(serverPath, publicPath, (err) => {
          if (err) throw err;
          console.log("File copied to public directory");
        });
        res.sendFile(serverPath);
      }
    });
  });
});     


//Post a new value into DB
app.post("/events", (req, res) => {
  const data = req.body;
  const id = `urn:uuid:${uuidv4()}`; //Generate unique id
  const publishedDate = new Date().toISOString(); //Set the current date as published
  const updatedDate = new Date().toISOString(); //Set the current date as updated
  sql = `INSERT INTO events(name, eventTitle, description, date, link, id, published, updated) 
        VALUES (?,?,?,?,?,?,?)`;
  db.run(
    sql,
    [
      req.body.yourName,
      req.body.eventTitle,
      req.body.description,
      req.body.date,
      "http://example.org/foobar",
      id,
      publishedDate,
      updatedDate,
    ],
    (err) => {
      if (err) return console.error(err.message);
    }
  );
  console.log(data);
});

//Retrieves and parses values
app.get("/otherEvents", (req, res) => {
  const ATOM_URL = `https://www.joshwcomeau.com/rss.xml`;

  fetch(ATOM_URL)
    .then((response) => response.text())
    .then((str) => {
      parseString(str, { trim: true }, function (err, result) {
        
        //Handle the parsed XML data here
        const entries = result.feed.entry;
        entries.forEach((entry) => {
          const eventData = {
            name: entry.author[0].name[0],
            eventTitle: entry.title[0],
            date: entry.published[0],
            description: entry.summary[0],
            id: entry.id[0], 
            link: "http://example.org/foobar",
            published: new Date().toISOString(), 
            updated: new Date().toISOString() 
          };
        
        //Assuming the id is provided in the external data
        const id = entry.id[0]; 

        //Check if the event with the same id already exists in the database
        const checkSql = `SELECT COUNT(*) FROM events WHERE id = ?`;
        db.get(checkSql, [id], (err, row) => {
          if (row['COUNT(*)'] == 0) { // If the event doesn't exist, insert it
            const sql = `INSERT INTO events(id, name, eventTitle, date, description, link, published, updated) 
                        VALUES (?,?,?,?,?,?,?,?)`;
            db.run(sql, [
              id,
              eventData.name,
              eventData.eventTitle,
              eventData.date,
              eventData.description,
              "http://example.org/foobar",
              new Date().toISOString(), 
              new Date().toISOString() 
            ], (err) => {
              if (err) return console.error(err.message);
            });
          }
        });
      });

      res.send("Data successfully inserted into the database");
      });
    });
});


export default server;

// sql =
//   "CREATE TABLE events(id INTEGER PRIMARY KEY, name, eventTitle, date, description)";
// db.run(sql)
