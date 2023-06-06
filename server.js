const express = require("express");
const path = require("path");
const router = express.Router();
const mysql = require("mysql");
const parser = require("body-parser");
const nodemailer = require("nodemailer");

const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const crypto = require("crypto");

const app = express();

const port = process.env.port || 3000;

app.use("/assets", express.static(path.join(__dirname, "public")));
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

// MySQL Connection

var con = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "the_gears_publication",
});

// Cookies

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

// Home

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/index.html"));
});

// News

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

// Forums

router.get("/forums", (req, res) => {
  authCheck(req, res, "/views/forum.html", false);
});

router.get("/forum/:id?", (req, res) => {
  const id = req.params.id;

  if (id === undefined) res.redirect("/forums");
  else {
    authCheck(req, res, "/views/forum_content.html", false);
  }
});

router.get("/get_forums", (req, res) => {
  con.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      "SELECT forum_id, forum_title, forum_cont FROM forum;",
      (error, results, fields) => {
        var jsonResults = JSON.stringify(results);
        res.send(jsonResults);
        connection.release();
        if (error) throw error;
      }
    );
  });
});

router.get("/get_forum_content", (req, res) => {
  var id = req.query.id;
  con.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      "SELECT forum_title, forum_author, forum_cont FROM forum WHERE forum_id = '" +
      id +
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

// Authentication

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

router.get("/auth/forgot_pass", (req, res) => {
  authCheck(req, res, "/views/forgotpass.html", true);
});

router.post("/auth/send_code", (req, res) => {
  var umail = req.body.umail;

  if (umail) {
    con.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "SELECT user_email AS email, user_uname AS uname FROM auth where user_uname = ? OR user_email = ?",
        [umail, umail],
        (error, resu, fields) => {
          if (resu[0] != undefined) {
            var objUname = resu[0].uname;
            var objEmail = resu[0].email;
            var randomCode = Math.floor(100000 + Math.random() * 900000);

            connection.query(
              "UPDATE auth SET user_verify = ? WHERE user_uname = ?",
              [randomCode, objUname],
              (erro, resul, fields) => {
                sendResetCode(objEmail, randomCode).catch(console.error);
                console.log(objUname + ": Reset Code Sent");
                res.send(objEmail);
                connection.release();
                if (erro) res.send("0");
              }
            );
            if (error) throw error;
          } else {
            res.send("0");
          }
        }
      );
    });
  } else {
    res.send("Please enter your email address!");
    res.end();
  }
});

router.post("/auth/verify_code_pass", (req, res) => {
  var email = req.body.email;
  var rcode = req.body.rcode;

  if (rcode) {
    con.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "SELECT user_email AS email, user_uname AS uname FROM auth where user_email = ? AND user_verify = ?",
        [email, rcode],
        (error, resu, fields) => {
          console.log(resu[0].uname);
          if (resu[0] != undefined) {
            var objUname = resu[0].uname;
            var objEmail = resu[0].email;

            console.log(objUname + ": Verification Success");
            res.send(objEmail);
            connection.release();
            if (error) throw error;
          } else {
            res.send("2");
          }
        }
      );
    });
  } else {
    res.send("Please enter your verification code!");
    res.end();
  }
});

router.post("/auth/reset_pass", (req, res) => {
  var email = req.body.email;
  var rcode = req.body.rcode;
  var pass = req.body.pass;

  if (email && pass) {
    var sha256Hash = crypto.createHash("sha256");
    var pwordData = sha256Hash.update(pass, "utf-8");
    var pwordHash = pwordData.digest("hex");

    con.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "UPDATE auth SET user_pass = ? WHERE user_email = ? AND user_verify = ?",
        [pwordHash, email, rcode],
        (error, resu, fields) => {
          res.send(email);
          connection.release();
          if (error) throw error;
        }
      );
    });
  } else {
    res.send("Please enter your verification code!");
    res.end();
  }
});

router.get("/auth/logout", (req, res) => {
  var uname = req.session.username;
  req.session.destroy(function (err) {
    console.log(uname + ": Logout");
  });
  res.redirect("/");
});

// Profile

router.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/profile.html"));
});

router.get("/get_profile", (req, res) => {
  var uname = req.session.username;
  con.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      "SELECT user_fname AS fname, user_lname AS lname, user_uname AS uname, user_email AS email FROM auth WHERE user_uname = ?",
      [uname],
      (error, results, fields) => {
        var jsonResults = JSON.stringify(results);
        res.send(jsonResults);
        connection.release();
        if (error) throw error;
      }
    );
  });
});

router.post("/edit_profile", (req, res) => {
  var uname = req.session.username;
  var fname = req.query.fname;
  var lname = req.query.lname;
  var email = req.query.email;

  con.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      "UPDATE auth SET user_fname = ?, user_lname = ?, user_email = ? WHERE user_uname = ?",
      [fname, lname, email, uname],
      (error, results, fields) => {
        res.send("1");
        connection.release();
        if (error) throw error;
      }
    );
  });
});

router.post("/delete_profile", (req, res) => {
  var uname = req.session.username;
  con.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      "DELETE FROM auth WHERE user_uname = ?",
      [uname],
      (error, results, fields) => {
        res.send("1");
        connection.release();
        if (error) throw error;
      }
    );
  });
});

async function sendResetCode(email, code) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "ngaspi.main@gmail.com", // generated ethereal user
      pass: "sopwxnamszjdovqp", // generated ethereal password
    },
  });

  let info = await transporter.sendMail({
    from: '"The Gears Publication" <noreply-noreply@noreply.com>', // sender address
    to: email, // list of receivers
    subject: "The Gears Publication - User Reset Code", // Subject line
    text: "Your verification code for reset password is " + code + ".", // plain text body
  });
}

function authCheck(req, res, v, isAuth) {
  if (!isAuth) {
    if (req.session.loggedin) res.sendFile(path.join(__dirname + v));
    else res.redirect("/auth");
  } else {
    if (req.session.loggedin) res.redirect("/");
    else res.sendFile(path.join(__dirname + v));
  }
}

// Contact
router.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/contact.html"));
});


app.use("/", router);

// Listen Port

app.listen(port, () => {
  console.log("Running on port " + port);
});
