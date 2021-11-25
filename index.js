// const express = require("express");
// const app = express();
// const static = express.static(__dirname + "/public");
// const configRoutes = require('./routes');

// const exphbs = require("express-handlebars");

// app.use("/public", static);
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");

// configRoutes(app);

// app.listen(3000, () => {
//   console.log("We've now got a server!");
//   console.log("Your routes will be running on http://localhost:3000");
// });


const parkingsData = require('./data/parkings');
const listingsData = require('./data/listings');

async function main() {
//   await parkingsData.createParkings("6164f085181bfcb0325557c6",
//   // [],
//   // "abc.jpg",
//   "abc abc",
//   "ahc ahs",
//   "NJ",
//   "07307",
//   "",
//   "",
//   { vehicleType: ["sedan"] },
//   []);

  await listingsData.createListing("6164f085181bfcb0325557c6", "11/25/2021", "11/25/2021", "10:00:00",
  "12:00:00", 20)

}


main();

