const { ObjectId } = require("bson");
const mongoCollections = require("../config/mongoCollections");
const parkings = mongoCollections.parkings;

//get parkings by city/state/zipcode - Dashboard Route
async function getParkingsByCityStateZip(
  city,
  state,
  zipcode = checkParameters()
) {
  const zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
  //string and trim length checks
  if (
    typeof zipcode != "string" ||
    typeof city != "string" ||
    typeof state != "string"
  ) {
    throw "Parameter of defined type not found";
  }
  //state validator
  if (city != "") {
    if (city.trim().length === 0) throw "City cannot be blanks";
  }

  //state validator+
  if (state != "") {
    if (stateList.indexOf(state) == -1) {
      throw "State not found";
    }
  }

  //zip code validator
  if (zipcode != "") {
    if (!zipRegex.test(zipcode)) {
      throw "Incorrect zip code";
    }
  }

  const cityFilter = {
    $or: [
      {
        city: new RegExp(city),
      },
      {
        state: state,
      },
      {
        zip: zipcode,
      },
    ],
  };
  const noCityFilter = {
    $or: [
      {
        state: state,
      },
      {
        zip: zipcode,
      },
    ],
  };

  const parkingCollection = await parkings();
  let listedParkings;
  if (city != "") {
    listedParkings = await parkingCollection.find(cityFilter).toArray();
  } else {
    listedParkings = await parkingCollection.find(noCityFilter).toArray();
  }

  if (listedParkings === null) throw "No parking found";
  //parkingId._id = parkingId._id.toString();

  return listedParkings;
}

//get Parking based on listerid
async function getParkingsOfLister(id = checkParameters()) {
  id = id.trim();
  id = ObjectId(id);

  const parkingCollection = await parkings();
  const listedParkings = await parkingCollection
    .find({ listerId: id })
    .toArray();

  if (listedParkings === null) throw "No parking found";
  //parkingId._id = parkingId._id.toString();

  return listedParkings;
}

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
  parkingImg,
  address,
  city,
  state,
  zip,
  longitude,
  latitude,
  category = checkParameters()
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
    category
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
    state,
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

//update parkings with parameters
async function updateParking(
  parkingId,
  listerId,
  parkingImg,
  address,
  city,
  state,
  zip,
  longitude,
  latitude,
  category = checkParameters()
) {
  //trim values to reject blank spaces or empty
  listerId = listerId.trim();
  parkingImg = parkingImg.trim();
  state = state.trim();
  zip = zip.trim();
  longitude = longitude.trim(); //optional to be filled by Geolocation API
  latitude = latitude.trim(); ////optional to be filled by Geolocation API

  validateID(parkingId);
  validateID(listerId);

  validate(
    parkingImg,
    address,
    city,
    state,
    zip,
    longitude,
    latitude,
    category
  );

  parkingId = ObjectId(parkingId);

  //check if parking exists
  const parkingCollection = await parkings();
  const checkParking = await parkingCollection.findOne({ _id: parkingId });

  if (!checkParking) throw "Parking not available";

  let updateParkingObj = {
    listerId: ObjectId(listerId),
    parkingImg: parkingImg,
    address: address,
    city: city,
    state: state,
    zip: zip,
    longitude: longitude,
    latitude: latitude,
    category: category,
  };

  //update parkings
  const updateParking = await parkingCollection.updateOne(
    { _id: parkingId },
    { $set: updateParkingObj }
  );
  if (updateParking.modifiedCount === 0) throw "Parking could not be updated";

  const newParking = await getParking(parkingId.toString());

  return newParking;
}

//delete parkings with id
async function deleteParking(parkingId = checkParameters()) {
  validateID(parkingId);
  parkingId = parkingId.trim();
  let result = {};
  parkingId = ObjectId(parkingId);

  const parkingCollection = await parkings();

  //check if parking exists
  const checkparking = await getParking(parkingId.toString());
  if (!checkparking) throw "Parking info does not exists ";

  //delete parking
  const deleteParking = await parkingCollection.deleteOne({ _id: parkingId });
  if (deleteParking.deletedCount == 0) {
    throw "Could not delete the parking";
  } else {
    result.parkingId = checkparking._id;
    result.deleted = true;
  }
  return result;
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
  category
  // parkingReviews
) {
  const zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
  var longLatRegex = new RegExp("^-?([1-8]?[1-9]|[1-9]0).{1}d{1,6}");

  //string and trim length checks
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

  //state validator
  if (typeof state === "string") {
    if (stateList.indexOf(state) == -1) {
      throw "State not found";
    }
  }

  //zip code validator
  if (!zipRegex.test(zip)) {
    throw "Incorrect zip code";
  }
  // commented for now
  //   if (typeof longitude != "number" || typeof latitude != "number") {
  //     throw "longitude and latitude should be numbers";
  //   }

  //vehicle type validator
  // if (typeof category == "object") {
  //   if (
  //     Array.isArray(category.vehicleType) &&
  //     category.vehicleType.length > 0
  //   ) {
  //     category.vehicleType.forEach((x) => {
  //       if (typeof x !== "string") throw "vehicle type must be a string";
  //     });
  //   } else throw "vehicle type must be array of length atleast 1";
  // } else throw "category must be an object";

  // if (Array.isArray(parkingReviews)) {
  //   parkingReviews.forEach((x) => {
  //     if (typeof x != "string") throw "review id must be a string";
  //     if (x.trim().length === 0) throw "review id cannot be empty or blanks";
  //     if (!ObjectId.isValid(id)) throw "Object Id is not valid";
  //   });
  // }
}

function validateID(id) {
  if (typeof id != "string") {
    throw "Argument of type string expected";
  }
  if (id.trim().length === 0) {
    throw "String cannot be blanks or empty";
  }
  if (!ObjectId.isValid(id)) {
    throw "Object Id is not valid";
  }
}

//check for defined parameters else throw error
function checkParameters() {
  throw "Expected arguments not found";
}

const stateList = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "PR",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

module.exports = {
  createParkings,
  getParking,
  updateParking,
  deleteParking,
  getParkingsOfLister,
  getParkingsByCityStateZip,
};
