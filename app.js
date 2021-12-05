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

const rewriteUnsupportedBrowserMethodsPut = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  // if (req.body && req.body._method) {
  //   req.method = req.body._method;
  //   delete req.body._method;
  // }

  if (req.url == "/parkings/update/") {
    req.method = "PUT";
  }
  // let the next middleware run:
  next();
};

const rewriteUnsupportedBrowserMethodsDelete = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  // if (req.body && req.body._method) {
  //   req.method = req.body._method;
  //   delete req.body._method;
  // }

  if (req.url.startsWith("/parkings/delete/")) {
    req.method = "DELETE";
  }
  next();
};
app.use(
  session({
    name: "AuthCookie",
    secret: "Beer Battered chicken wings with salsa!",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, //cookie day timeout
  })
);

app.use(function (req, res, next) {
  userStatus = !req.session.user
    ? "Non-Authenticated User"
    : "Authenticated User";
  console.log(
    "[" +
      new Date().toUTCString() +
      "]:" +
      " " +
      req.method +
      " " +
      req.originalUrl +
      " (" +
      userStatus +
      ")"
  );
  next();
});

app.use("/", (req, res, next) => {
  if (
    !req.session.user &&
    !(
      req.url == "/users/createProfile" ||
      req.url == "/users/login" ||
      req.url == "/users/createUser"
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
    (req.url == "/users/createProfile" ||
      req.url == "/users/login" ||
      req.url == "/users/createUser")
  ) {
    res.redirect("/");
    return;
  }
  next();
});

app.use(rewriteUnsupportedBrowserMethodsPut);
app.use(rewriteUnsupportedBrowserMethodsDelete);

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
