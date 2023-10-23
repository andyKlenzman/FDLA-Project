import cors from "cors";
import express from "express";
import localRoute from "./routes/localRoute.js";
import decentralizedRouter from "./routes/decentralizedRoute.js";
import db from "./db/db.js";

//Create our server, add our packages, and turn it on
let app = express();
app.use(cors());
app.use(express.json());

// let sql =
//   "CREATE TABLE events(id, title, link, published, updated, summary, author)";
// db.run(sql); 

const server = app.listen("4000", () => {
  console.log("App is listening at http://localhost:4000");
});

app.use("/", localRoute);
app.use("/decentral", decentralizedRouter);

export default server;
