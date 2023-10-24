import { Feed } from "feed";
import fs from "fs";
import path from "path";
import { Router } from "express";
import db from "../db/db.js";
import createDirname from "../utils/createDirname.js";
import printServerStatus from "../utils/printServerStatus.js";
import { parseString } from "xml2js";

const decentralizedRouter = Router();
const __dirname = createDirname(import.meta.url);


decentralizedRouter.route("/").get((req, res) => {
  printServerStatus("Decentral get req");
  // const ATOM_URL = `https://gioele.uber.space/k/fdla2023/feed1.atom`;
  const atomURL = req.body.atomURL;
  console.log(atomURL);

  fetch(atomURL)
    .then((response) => response.text())
    .then((str) => {
      parseString(str, { trim: true }, function (err, result) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(result);
      });
    });
});

export default decentralizedRouter;
