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

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
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

app.use(
  session({
    name: "AuthCookie",
    secret: "some secret string!",
    resave: false,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  console.log(req.session.user);
  next();
});

app.use(rewriteUnsupportedBrowserMethods);
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
