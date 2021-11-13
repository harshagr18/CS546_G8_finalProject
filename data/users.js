const { users } = require("./../config/mongoCollections");
const { ObjectId } = require("mongodb");

function checkIsProperString(val) {
  if (!val) {
    throw `No input passed`;
  }
  if (typeof val !== "string") {
    throw `Not a string`;
  }

  if (val.length == 0) {
    throw `Length of string is 0`;
  }
  if (val.trim().length == 0) {
    throw `String is only spaces`;
  }
}

let exportedMethods = {
  async createUser(
    firstName,
    lastName,
    email,
    phoneNumber,
    username,
    address,
    city,
    state,
    zip
  ) {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !username ||
      !address ||
      !city ||
      !state ||
      !zip
    ) {
      throw `Missing parameter`;
    }

    checkIsProperString(firstName);
    checkIsProperString(lastName);
    checkIsProperString(address);
    checkIsProperString(city);
    checkIsProperString(username);

    const phoneRegex = /^\d{10}$/im;
    const emailRegex =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    const zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;

    if (!phoneRegex.test(phoneNumber)) {
      throw `Incorrect phone number format`;
    }
    if (!emailRegex.test(email)) {
      throw `Incorrect email format`;
    }
    if (!zipRegex.test(zipRegex)) {
      throw `Incorrect zip code`;
    }

    stateList = [
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

    found = false;

    for (let i = 0; i < stateList.length; i++) {
      if (state == stateList[i]) found = true;
    }

    if (found == false) {
      throw `State not found`;
    }

    let newUser = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phoneNumber: phoneNumber,
      username: username,
      address: address,
      city: city,
      state: state,
      zip: zip,
      listings: [],
      bookings: [],
      reviews: [],
    };

    const userCollection = await users();
    const insertInfo = await userCollection.insertOne(newUser);
    if (insertInfo.insertedCount === 0) throw `Could not add user`;

    return newUser;
  },
};

module.exports = exportedMethods;
