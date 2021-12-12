const { json } = require("express");
const connection = require("../config/mongoConnection");
const parkingReviews = require("../data/parkingReviews");
const parkings = require("../data/parkings");
const listings = require("../data/listings");
const users = require("../data/users");

const main = async () => {
  try {
    let user1 = await users.createUser(
      "Harsh",
      "Agrawal",
      "harshagrawal1802@gmail.com",
      1234567890,
      "harshagr1802",
      "12345678",
      "123 Saint Pauls Ave",
      "Hoboken",
      "NJ",
      "07306"
    );

    let user2 = await users.createUser(
      "Shivani",
      "Maurya",
      "smaurya@stevens.edu",
      1234567890,
      "smaurya",
      "12345678",
      "25 Central Ave",
      "Jersey City",
      "NJ",
      "07106"
    );

    let user3 = await users.createUser(
      "Harshal",
      "Vaidya",
      "hvaidya@stevens.edu",
      1234567890,
      "hvaidya",
      "12345678",
      "21 Sherman Ave",
      "Bayonne",
      "NJ",
      "07300"
    );

    let user4 = await users.createUser(
      "Shreyas",
      "Vispute",
      "svisput@stevens.edu",
      1234567890,
      "svisput",
      "12345678",
      "211 Congress St.",
      "Bayonne",
      "NJ",
      "07333"
    );

    let createParking1 = await parkings.createParkings(
      user1,
      "public/images/parkingImg-1639283850869.jpg",
      "105 Sherman Ave",
      "Jersey City",
      "NJ",
      "07111",
      "-74.04739671755404",
      "40.74463986230668",
      ["sedan", "suv"],
      "open"
    );
    let createParking2 = await parkings.createParkings(
      user1,
      "public/images/parkingImg-1639283850869.jpg",
      "123 Saint Pauls Ave",
      "Jersey City",
      "NJ",
      "07306",
      "-74.05669010392448",
      "40.73640363385621, ",
      ["sedan", "suv"],
      "open"
    );
    let createParking3 = await parkings.createParkings(
      user2,
      "public/images/parkingImg-1639283850869.jpg",
      "50 Beach St.",
      "Jersey City",
      "NJ",
      "07201",
      "-74.05651408686698",
      "40.744427548956196",
      ["sedan", "suv"],
      "open"
    );

    let createParking4 = await parkings.createParkings(
      user2,
      "public/images/parkingImg-1639283850869.jpg",
      "121 Congress St.",
      "Jersey City",
      "NJ",
      "07300",
      "-74.04623571755381",
      "40.751064743459",
      ["sedan", "suv"],
      "open"
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
