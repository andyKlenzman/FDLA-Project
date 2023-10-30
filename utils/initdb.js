import db from "../db/db.js";

const initdb = () => {
  const sql =
    "CREATE TABLE events(id, title, link, published, updated, summary, author)";
  db.run(sql);
};

export default initdb;
