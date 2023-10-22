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

//used to read outside ATOM files, and patse into JSON to be added to our database
var parseString = xml2js.parseString;

//Create and turn on our server
let app = express();
app.use(cors());
app.use(express.json());

const server = app.listen("4000", () => {
  console.log("App is listening at http://localhost:4000");
});

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
      title: "Events",
      author: {
        name: "Andy Klenzman and Company",
      },
    });

    //Add each database entry to that row
    rows.forEach((row) => {
      feed.addItem({
        title: row.eventTitle,
        id: row.id,
        date: row.date,
        description: row.description,
        author: { name: row.name },
      });
    });

    //Write to the file, and if the write is successful, send it
    fs.writeFile("./atomfile/atom.xml", feed.atom1(), (err) => {
      if (err) console.log(err);
      else {
        console.log("File written successfully\n");
        res.sendFile(path.join(__dirname, "./atomfile/atom.xml"));
      }
    });
  });
});

//Post a new value into DB
app.post("/events", (req, res) => {
  const data = req.body;
  const id = `urn:uuid:${uuidv4()}`; //Generate unique id
  sql = `INSERT INTO events(name, eventTitle, date, description) VALUES (?,?,?,?)`;
  db.run(
    sql,
    [
      req.body.yourName,
      req.body.eventTitle,
      req.body.date,
      req.body.description,
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
            description: entry.summary[0]
        };
        
        //Assuming the id is provided in the external data
        const id = entry.id[0]; 

        //Check if the event with the same id already exists in the database
        const checkSql = `SELECT COUNT(*) FROM events WHERE id = ?`;
        db.get(checkSql, [id], (err, row) => {
          if (row['COUNT(*)'] == 0) { // If the event doesn't exist, insert it
            const sql = `INSERT INTO events(id, name, eventTitle, date, description) VALUES (?,?,?,?,?)`;
            db.run(sql, [id, eventData.name, eventData.eventTitle, eventData.date, eventData.description], (err) => {
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
