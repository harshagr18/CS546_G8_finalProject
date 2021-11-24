const { json } = require("express");
const connection = require("../config/mongoConnection");
const parkingReviews  = require("../data/parkingReviews");
const parkings = require("../data/parkings");

const main = async () => {
  try {
    try {
      const db = await connection();
      await db.dropDatabase();
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
      //  await db.serverConfig.close();

      //    const db = await connection();
      console.log(firstRestaurant._id);
      firstReview = await parkingReviews.createReview(
        firstRestaurant._id,
        "7174f085181bfcb0325557c8",
        5,
        "11/24/2021",
        "This is a very nice space"
      );

    console.log(firstReview);
    await db.connection.close();
    } catch (error) {
      console.log(error);
    }
  } catch (error) {}
}  

main().catch((error) => {
  console.log(error);
});
