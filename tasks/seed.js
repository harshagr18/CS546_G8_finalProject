const { json } = require("express");
const connection = require("../config/mongoConnection");
const parkings = require("../data/parkings");

const main = async () => {
  try {
    try {
      firstRestaurant = await parkings.createParkings(
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
      console.log(firstRestaurant);
      const db = await connection();
      await db._connection.close();
    } catch (error) {
      console.log(error);
    }
  } catch (error) {}
};

main().catch((error) => {
  console.log(error);
});
