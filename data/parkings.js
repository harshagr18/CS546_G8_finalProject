const { ObjectId } = require("bson");
const mongoCollections = require("../config/mongoCollections");
const parkings = mongoCollections.parkings;

//get Parking based on id
async function getParking(id = checkParameters()) {
  id = id.trim();
  id = ObjectId(id);

  const parkingCollection = await parkings();
  const parkingId = await parkingCollection.findOne({ _id: id });

  if (parkingId === null) throw "No parking found";
  parkingId._id = parkingId._id.toString();

  return parkingId;
}

//create parkings
async function createParkings(
  listerId,
  listing,
  parkingImg,
  address,
  city,
  state,
  zip,
  longitude,
  latitude,
  category,
  parkingReviews = checkParameters()
) {
  //trim values to reject blank spaces or empty
  listerId = listerId.trim();
  parkingImg = parkingImg.trim();
  state = state.trim();
  zip = zip.trim();
  longitude = longitude.trim(); //optional to be filled by Geolocation API
  latitude = latitude.trim(); ////optional to be filled by Geolocation API

  validate(
    parkingImg,
    address,
    city,
    state,
    zip,
    longitude,
    latitude,
    category,
    parkingReviews
  );
  listerId = ObjectId(listerId);
  let newParking = {
    listerId,
    listing: [],
    parkingImg,
    overallRating: 0,
    address,
    city,
    zip,
    longitude,
    latitude,
    category,
    parkingReviews: [],
  };

  const parkingCollection = await parkings();
  const insertParking = await parkingCollection.insertOne(newParking);
  if (insertParking.insertedCount === 0) throw "Error adding parking";

  const newParkingId = insertParking.insertedId;
  const newParkingData = await getParking(newParkingId.toString());

  return newParkingData;
}

//validate inputs
function validate(
  parkingImg,
  address,
  city,
  state,
  zip,
  longitude,
  latitude,
  category,
  parkingReviews
) {
  const zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
  var longLatRegex = new RegExp("^-?([1-8]?[1-9]|[1-9]0).{1}d{1,6}");

  if (
    typeof parkingImg != "string" ||
    typeof address != "string" ||
    typeof city != "string" ||
    typeof state != "string"
  ) {
    throw "Parameter of defined type not found";
  } else if (
    parkingImg.length === 0 ||
    address.length === 0 ||
    city.length === 0 ||
    state.length === 0
  ) {
    throw "Parameter cannot be blank spaces or empty values";
  }
  if (!zipRegex.test(zip)) {
    throw "Incorrect zip code";
  }
  // commented for now
  //   if (typeof longitude != "number" || typeof latitude != "number") {
  //     throw "longitude and latitude should be numbers";
  //   }

  if (typeof category == "object") {
    if (
      Array.isArray(category.vehicleType) &&
      category.vehicleType.length > 0
    ) {
      category.vehicleType.forEach((x) => {
        if (typeof x !== "string") throw "vehicle type must be a string";
      });
    } else throw "vehicle type must be array of length atleast 1";
  } else throw "category must be an object";
  if (Array.isArray(parkingReviews)) {
    parkingReviews.forEach((x) => {
      if (typeof x != "string") throw "review id must be a string";
      if (x.trim().length === 0) throw "review id cannot be empty or blanks";
      if (!ObjectId.isValid(id)) throw "Object Id is not valid";
    });
  }
}

//check for defined parameters else throw error
function checkParameters() {
  throw "Expected arguments not found";
}

module.exports = {
  createParkings,
};
