const express = require("express");
const path = require("path");
const router = express.Router();
const mysql = require("mysql");

const app = express();

const port = process.env.port || 3000;

var con = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "the_gears_publication",
});

app.use("/assets", express.static(path.join(__dirname, "public")));

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/index.html"));
});

router.get("/news/:id?", (req, res) => {
  const id = req.params.id;

  if (id === undefined) res.sendFile(path.join(__dirname + "/views/news.html"));
  else res.sendFile(path.join(__dirname + "/views/news_details.html"));
  
});

router.get("/get_news", (req, res) => {
  con.getConnection((err, connection) => {
    if (err) throw err;
    connection.query("SELECT news_id, news_title FROM news_articles;", (error, results, fields) => {
        var jsonResults = JSON.stringify(results);
        res.send(jsonResults);
        connection.release();
        if (error) throw error;
      }
    );
  });
});

app.use("/", router);

app.listen(port, () => {
  console.log("Running on port " + port);
});
