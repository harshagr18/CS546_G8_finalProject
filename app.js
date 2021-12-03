const express = require("express");
const session = require("express-session");
const app = express();
const static = express.static(__dirname + "/public");
var bodyParser = require("body-parser");

const configRoutes = require("./routes");
const exphbs = require("express-handlebars");

app.use("/public", static);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: "AuthCookie",
    secret: "some secret string!",
    resave: false,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  console.log("Path is", req._parsedOriginalUrl.pathname.toString());
  console.log("Current user is", req.session.user);
  next();
});

app.use("/", (req, res, next) => {
  if (
    !req.session.user &&
    !(
      req._parsedOriginalUrl.pathname.toString() == "/users/createProfile" ||
      req._parsedOriginalUrl.pathname.toString() == "/users/login" ||
      req._parsedOriginalUrl.pathname.toString() == "/users/createUser"
    )
  ) {
    res.redirect("/users/login");
    return;
  }
  next();
});

app.use("/", (req, res, next) => {
  if (
    req.session.user &&
    (req._parsedOriginalUrl.pathname.toString() == "/users/createProfile" ||
      req._parsedOriginalUrl.pathname.toString() == "/users/login" ||
      req._parsedOriginalUrl.pathname.toString() == "/users/createUser")
  ) {
    res.redirect("/");
    return;
  }
  next();
});

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
