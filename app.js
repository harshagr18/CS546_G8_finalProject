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
  console.log(req.session.user);
  next();
});

app.use("/listings/bookListing/:id", (req,res,next) => {
  // if (req.session.user) {
    req.method = 'put';
    next();
  // } else {
  //   return res.redirect('/users/login');
  // }
})

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
