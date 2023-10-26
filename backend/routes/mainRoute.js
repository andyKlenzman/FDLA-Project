import { Feed } from "feed";
import fs from "fs";
import path from "path";
import { Router } from "express";
import db from "../db/db.js";
import createDirname from "../utils/createDirname.js";
import printServerStatus from "../utils/printServerStatus.js";
import { randomUUID } from "crypto";
import { parseString } from "xml2js";
import extractAtomData from "../utils/extractAtomData.js";

const mainRoute = Router();
const __dirname = createDirname(import.meta.url);
const atomFilePath = path.join(__dirname, "../atomfile/atom.xml");
let sql;

mainRoute
  .route("/")
  // This endpoint returns the atom file with all of our local data
  .get((req, res) => {
    printServerStatus("get request");

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

      //Add each databse entry into the atom file
      rows.forEach((row) => {
        const { title, link, id, published, updated, summary, author } = row;
        feed.addItem({
          title: title,
          id: id,
          link: link,
          date: new Date(updated),
          published: new Date(published),
          summary: summary,
          author: [
            {
              name: author,
            },
          ],
        });
      });

      // Write to the file, and if the write is successful, send it
      fs.writeFile(atomFilePath, feed.atom1(), (err) => {
        if (err) console.log(err);
        else {
          console.log("File written successfully\n");
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.sendFile(atomFilePath);
        }
      });
    });
  })
  .post((req, res) => {
    printServerStatus("Post request");

    const currentDate = new Date();
    const { title, link, summary, author } = req.body;

    if (!title || !link || !summary || !author) {
      // err = new Error(`Campsite ${req.params.campsiteId} not found`);
      // err.status = 404;
      // return next(err);

      return console.error("Incomplete necessary data fields");
    }

    sql = `INSERT INTO events(id, title, link, published, updated, summary, author) VALUES (?,?,?,?,?,?,?)`;
    db.run(
      sql,
      [randomUUID(), title, link, currentDate, currentDate, summary, author],
      (err) => {
        if (err) return console.error(err.message);
      }
    );

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end("New record entered");
  });

// Injests information from outside Atom files and adds it to our DB
mainRoute.route("/atom").put((req, res) => {
  printServerStatus("Decentral get req");

  const atomURL = req.body.atomURL;
  console.log(atomURL);

  fetch(atomURL)
    .then((response) => response.text())
    .then((str) => {
      parseString(str, function (err, result) {
        const atomData = extractAtomData(result);

        atomData.forEach((data) => {
          const sql = `SELECT EXISTS (SELECT 1 FROM events WHERE id <> '${data.id}' LIMIT 1) AS exists`;
          const result = db.get(sql);
          const duplicateExistsByID = result.exists === 1;

          if (duplicateExistsByID) {
            //get out of here!
          }
        });
      });
    });
});

// res.statusCode = 200;
// res.setHeader("Content-Type", "application/json");

export default mainRoute;
