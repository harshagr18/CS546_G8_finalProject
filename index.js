// const express = require("express");
// const app = express();
// const static = express.static(__dirname + "/public");
// const configRoutes = require('./routes');
// const session = require('express-session')

// const exphbs = require("express-handlebars");

// app.use("/public", static);
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");

// app.use(session({
//   name: 'AuthCookie',
//   secret: 'some secret string!',
//   resave: false,
//   saveUninitialized: true,
//   cookie: {maxAge:30000}
// }));

// configRoutes(app);

// app.listen(3000, () => {
//   console.log("We've now got a server!");
//   console.log("Your routes will be running on http://localhost:3000");
// });













// // const parkings = require("./data/parkings");
// // const listings = require("./data/listings");

// // async function main() {
// //   // let createParking = await parkings.createParkings(
// //   //   "6164f085181bfcb0325557c6",
// //   //   "abc.jpg",
// //   //   "abc abc",
// //   //   "ahc ahs",
// //   //   "NJ",
// //   //   "07307",
// //   //   "",
// //   //   "",
// //   //   { vehicleType: ["sedan"] }
// //   // );

// //   // let createListing = await listings.createListing(
// //   //   "61a2eb490b44342c5afbcd40",
// //   //   "11/29/2021",
// //   //   "11/29/2021",
// //   //   "10:00:00",
// //   //   "12:00:00",
// //   //   20
// //   // );

// //   // let getListingData = await listings.getListing("61a2ef5d665d8735c33d4dd9");
// //   // console.log(getListingData);

// //   // console.log("get all listings");

// //   // let getAllListingsData = await listings.getAllListings("61a2eb490b44342c5afbcd40");
// //   // console.log(getAllListingsData);

// //   // let removeListingData = await listings.removeListing("61a2ef5d665d8735c33d4dd9");
// //   // console.log(removeListingData);

// //   let updateLister = await listings.updateListingByLister(
// //     "61a2eb490b44342c5afbcd40",
// //     "61a2f5157553f28102cae4ec",
// //     "11/30/2021",
// //     "11/30/2021",
// //     "11:00:00",
// //     "15:00:00",
// //     22
// //   );
// //   console.log(updateLister);
// // }

// // main();
