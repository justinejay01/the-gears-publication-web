const express = require("express");
const path = require("path");
const router = express.Router();
const mysql = require("mysql");
const parser = require("body-parser");

const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const crypto = require("crypto");

const app = express();

const port = process.env.port || 3000;

var con = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "the_gears_publication",
});

app.use("/assets", express.static(path.join(__dirname, "public")));
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.use(
  session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
    resave: false,
    secret: "secret",
    saveUninitialized: true,
  })
);

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
    connection.query(
      "SELECT news_id, news_title FROM news_articles;",
      (error, results, fields) => {
        var jsonResults = JSON.stringify(results);
        res.send(jsonResults);
        connection.release();
        if (error) throw error;
      }
    );
  });
});

router.get("/get_news_article", (req, res) => {
  con.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      "SELECT news_title, news_author, news_desc FROM news_articles WHERE news_id = '" +
        req.query.id +
        "'",
      (error, results, fields) => {
        var jsonResults = JSON.stringify(results);
        res.send(jsonResults);
        connection.release();
        if (error) throw error;
      }
    );
  });
});

router.get("/forum", (req, res) => {
  authCheck(req, res, "/views/forum.html", false);
});

router.get("/auth", (req, res) => {
  //if (req.session.loggedin) res.redirect("/");
  //else res.sendFile(path.join(__dirname + "/views/auth.html"));
  authCheck(req, res, "/views/auth.html", true);
});

router.get("/auth/check", (req, res) => {
  if (req.session.loggedin) res.send(req.session.username);
  else res.send("0");
});

router.post("/auth/login", (req, res) => {
  var uname = req.body.uname;
  var pword = req.body.pword;

  if (uname && pword) {
    var sha256Hash = crypto.createHash("sha256");
    var pwordData = sha256Hash.update(pword, "utf-8");
    var pwordHash = pwordData.digest("hex");

    con.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "SELECT user_fname AS fname, user_lname AS lname, user_role AS role FROM auth where user_uname = ? and user_pass = ?",
        [uname, pwordHash],
        (error, resu, fields) => {
          if (resu[0] != undefined) {
            var objFname = resu[0].fname;
            var objLname = resu[0].lname;
            var objRole = resu[0].role;
            userRole = objRole;
            userName = objFname + " " + objLname;

            req.session.loggedin = true;
            req.session.username = uname;
            console.log(uname + ": Login");
            res.send("1");

            connection.release();
            if (error) throw error;
          } else {
            res.send("0");
          }
        }
      );
    });
  } else {
    res.send("Please enter username and/or password!");
    res.end();
  }
});

router.post("/auth/reg", (req, res) => {
  var fname = req.body.fname;
  var lname = req.body.lname;
  var uname = req.body.uname;
  var email = req.body.email;
  var pword = req.body.pword;

  if (uname && pword && email) {
    con.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "SELECT count(user_uname) AS c FROM auth where user_uname = ?",
        [uname],
        (error, resu, fields) => {
          var result = resu[0].c;
          if (result == "1") {
            res.send("1");
          } else {
            var sha256Hash = crypto.createHash("sha256");
            var pwordData = sha256Hash.update(pword, "utf-8");
            var pwordHash = pwordData.digest("hex");
            connection.query(
              "INSERT INTO auth (user_fname, user_lname, user_uname, user_pass, user_email, user_role) values (?,?,?,?,?,?)",
              [fname, lname, uname, pwordHash, email, "user"],
              (erro, resul, fields) => {
                console.log(uname + ": Register");
                res.send("2");
                connection.release();
                if (erro) res.send("0");
              }
            );
          }
        }
      );
    });
  } else {
    res.send("Please enter username and/or password!");
    res.end();
  }
});

router.get("/auth/logout", (req, res) => {
  var uname = req.session.username;
  req.session.destroy(function(err) {
    console.log(uname + ": Logout");
  });
  res.redirect("/");
});

function authCheck(req, res, v, isAuth) {
  if (!isAuth) {
    if (req.session.loggedin) res.sendFile(path.join(__dirname + v));
    else res.redirect("/auth");
  } else {
    if (req.session.loggedin) res.redirect("/");
    else res.sendFile(path.join(__dirname + v));
  }
}

app.use("/", router);

app.listen(port, () => {
  console.log("Running on port " + port);
});
