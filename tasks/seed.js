const { json } = require("express");
const connection = require("../config/mongoConnection");
const parkingReviews  = require("../data/parkingReviews");
const parkings = require("../data/parkings");

const main = async () => {
  try {
    try {
      const db = await connection();
      await db.dropDatabase();
      firstParking = await parkings.createParkings(
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
  //    console.log(firstParking);
      //  await db.connection.close()();

      secondParking = await parkings.createParkings(
        "6264f085181bfcb0325557c6",
        [],
        "def.jpg",
        "def def",
        "bhc bhs",
        "NJ",
        "07308",
        "",
        "",
        { vehicleType: ["hatchBack"] },
        []
      );

    //  console.log(firstParking._id);
      let firstReview = await parkingReviews.createReview(
        firstParking._id,
        "7174f085181bfcb0325557c8",
        5,
        "11/27/2021",
        "This is a very nice space"
      );

      let secondReview = await parkingReviews.createReview(
        firstParking._id,
        "7274f085181bfcb0325557c8",
        2,
        "11/27/2021",
        "This is a very bad space. Not clean and very isolated."
      );

   // console.log(firstReview);

    let sameReview = await parkingReviews.getAllReviews(firstParking._id);
    console.log(sameReview);
    let oneReview = await parkingReviews.getReview(sameReview[0]._id);
    console.log(oneReview);
    let reviewUpdate = await parkingReviews.updateReview(sameReview[0]._id, 4, "This is an average space")
    let reviewRemove = await parkingReviews.removeReview(sameReview[0]._id);

    await db.serverConfig.close();
    } catch (error) {
      console.log(error);
    }
  } catch (error) {}
}  

main().catch((error) => {
  console.log(error);
});