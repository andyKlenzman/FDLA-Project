import cors from "cors";
import express from "express";
import mainRoute from "./routes/mainRoute.js";
import db from "./db/db.js";
import initdb from "./utils/initdb.js";
// initdb();

//Create our server, add our packages, and turn it on
let app = express();
app.use(cors());
app.use(express.json());


const server = app.listen("4000", () => {
  console.log("App is listening at http://localhost:4000");
});

app.use("/", mainRoute);

export default server;
