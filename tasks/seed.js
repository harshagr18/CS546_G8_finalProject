const { json } = require("express");
const connection = require("../config/mongoConnection");
const parkingReviews = require("../data/parkingReviews");
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
      "public/images/parkingImg-1639283850869.jpg",
      "105 Sherman Ave",
      "Jersey City",
      "NJ",
      "-74.04729",
      "40.744401",
      ["sedan", "suv"],
      "open"
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

    let firstReview = await parkingReviews.createReview(
      firstParking._id,
      "7174f085181bfcb0325557c8",
      5,
      "11/27/2021",
      "This is a very nice space"
    );

    let sameReview = await parkingReviews.getAllReviewsOfParking(
      createParking._id
    );
    let oneReview = await parkingReviews.getReview(sameReview[0]._id);
    let userReview = await parkingReviews.getAllReviewsOfUser(
      sameReview[0]._id
    );
    let reviewUpdate = await parkingReviews.updateReview(
      sameReview[0]._id,
      4,
      "This is an average space"
    );
    let reviewRemove = await parkingReviews.removeReview(sameReview[0]._id);

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
