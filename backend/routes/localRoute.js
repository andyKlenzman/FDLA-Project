import { Feed } from "feed";
import fs from "fs";
import path from "path";
import { Router } from "express";
import db from "../db/db.js";
import createDirname from "../utils/createDirname.js";
import printServerStatus from "../utils/printServerStatus.js";
import { randomUUID } from "crypto";

const localRoute = Router();
const __dirname = createDirname(import.meta.url);
const atomFilePath = path.join(__dirname, "../atomfile/atom.xml");
let sql;

// Create a new Date object with the current date and time and format the date in ISO 8601 format
const date = new Date();

localRoute
  .route("/")
  .get((req, res) => {
    printServerStatus("get request");

    //select all values from the database
    let sql = `SELECT * from events`;
    db.all(sql, [], async (err, rows) => {
      if (err) {
        throw err;
      }

      //setting the header information for the ATOM file
      let feed = new Feed({
        title: "Events Feed",
        author: {
          name: "FDLA Class",
        },
      });

      //Add each databse entry to that row
      rows.forEach((row) => {
        const { title, link, id, published, updated, summary, author } = row;
        feed.addItem({
          title: title,
          link: link,
          id: id,
          date: published,
          updated: updated,
          summary: summary,
          author: { name: author },
        });
      });

      // Write to the file, and if the write is successful, send it
      fs.writeFile(atomFilePath, feed.atom1(), (err) => {
        if (err) console.log(err);
        else {
          console.log("File written successfully\n");
          res.statusCode = 200;
          // res.setHeader("Content-Type", "application/json");
          res.sendFile(atomFilePath);
        }
      });
    });
  })

  .post((req, res) => {
    printServerStatus("Post request");
    sql = `INSERT INTO events(id, title, link, published, updated, summary, author) VALUES (?,?,?,?,?,?,?)`;
    const iso8601Date = date.toISOString();

    db.run(
      sql,
      [
        randomUUID(),
        req.body.title,
        req.body.link,
        iso8601Date,
        iso8601Date,
        req.body.summary,
        req.body.author,
      ],
      (err) => {
        if (err) return console.error(err.message);
      }
    );

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end("New record entered");
  });

export default localRoute;
