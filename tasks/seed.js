const { json } = require("express");
const connection = require("../config/mongoConnection");
const parkings = require("../data/parkings");
const users = require("../data/users");
const listings = require("../data/listings");
const reviews = require("../data/reviews");

const main = async () => {
  //parkings CRUD operations
  try {
    //create parkings
    let createParking = await parkings.createParkings(
      "6164f085181bfcb0325557c6",
      [],
      "abc.jpg",
      "abc abc",
      "ahc ahs",
      "NJ",
      "07307",
      "",
      "",
      { vehicleType: ["sedan"] },
      []
    );

    let createdUser = await users.createUser(
      "Harsh",
      "Agrawal",
      "123@gmail.com",
      1234567890,
      "floatyOtter",
      "123 Central Ave",
      "Hoboken",
      "NJ",
      "07306"
    );

    let createListing = await listings.createListing(
      "61a7885c5c659d453db6d179",
      "11/29/2021",
      "11/29/2021",
      "10:00:00",
      "12:00:00",
      20
    );

    const db = await connection();
    await db._connection.close();
  } catch (error) {
    console.log(error);
  }
};
main().catch((error) => {
  console.log(error);
});
