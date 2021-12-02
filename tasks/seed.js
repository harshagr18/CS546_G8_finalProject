const { json } = require("express");
const connection = require("../config/mongoConnection");
const parkings = require("../data/parkings");
const listings = require("../data/listings");

const main = async () => {
  //parkings CRUD operations
  try {
    //added by sv

    //get parkings
    let getParking = await parkings.getParking("6164f085181bfcb0325557c6");
    console.log(getParking);

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
    console.log(createParking);

    // update parking
    let updateParking = await parkings.updateParking(
      "61909dddc5745f08acbbeca0",
      "6164f085181bfcb0325557c6",
      "abc.jpg",
      "abc abc",
      "ahc ahs",
      "NJ",
      "07307",
      "",
      "",
      { vehicleType: ["sedan"] }
    );
    console.log(updateParking);

    // let createListing = await listings.createListing("61a2eb490b44342c5afbcd40", "11/29/2021", "11/29/2021", "10:00:00", "12:00:00", 20);

    // delete parking
    firstRestaurant = await parkings.deleteParking("61909dddc5745f08acbbeca0");
    console.log(firstRestaurant);

    const db = await connection();
    await db._connection.close();
  } catch (error) {
    console.log(error);
  }
};
main().catch((error) => {
  console.log(error);
});