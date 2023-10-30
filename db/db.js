import sqlite3 from "sqlite3";
import path from "path";
import createDirname from "../utils/createDirname.js";
import printServerStatus from "../utils/printServerStatus.js";

//Setting up the correct file pathway to our DB
const __dirname = createDirname(import.meta.url);
const dbPath = path.join(__dirname, "./events.db");

//Connecting to the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
  }
  printServerStatus("Connected to the database");
});

export default db;
