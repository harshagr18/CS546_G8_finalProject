const express = require("express");
const router = express.Router();
const { ObjectId } = require("bson");
const parkingsData = require("../data/parkings");
const path = require("path");
const sessionStorage = require("sessionstorage");

//added by sv

//image saving logic
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "./public/images",
  filename: function (req, file, callback) {
    const fullName = file.fieldname + "-" + Date.now() + ".jpg";
    callback(null, fullName);
  },
});

const upload = multer({
  fileFilter: function (req, file, cb) {
    const fileTypes = /png|jpeg|jpg/;
    const extName = fileTypes.test(path.extname(file.originalname));
    file.originalname.toLowerCase();
    const mimeType = fileTypes.test(file.mimetype);
    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb("Error: only png, jpeg, and jpg are allowed!");
    }
  },
  storage: storage,
});

//get the lister id
router.get("/", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/users/login");
    }
    const listerId = req.session.user.userId;
    let validId = validate(listerId);
    if (!validId) {
      res
        .status(400)
        .json({ error: "Id must be a valid string and an Object Id" });
      return;
    }
    //username calls user table and fetches lister id to get parkings from logged in user
    const getData = await parkingsData.getParkingsOfLister(listerId);
    res.render("pages/parkings/getParkings", {
      partial: "emptyPartial",
      parkdata: getData,
      title: "My Parkings",
    });
  } catch (error) {
    res.status(404).json({ message: "Page not found" });
  }
});

router.get("/create", async (req, res) => {
  try {
    // if (req.session.username) {
    //   return res.redirect("/private");
    // }
    res.render("pages/parkings/createParkings", {
      partial: "emptyPartial",

      title: "Create Parking",
      states: stateList,
    });
  } catch (error) {
    res.status(404).json({ message: "Page not found" });
  }
});

router.get("/edit/:id", async (req, res) => {
  try {
    let validId = validate(req.params.id);
    if (!validId) {
      res
        .status(400)
        .json({ error: "Id must be a valid string and an Object Id" });
      return;
    }
    if (!req.session.user) {
      return res.redirect("/users/login");
    }
    const listerId = req.session.user.userId;
    let validListerId = validate(listerId);
    if (!validListerId) {
      res
        .status(400)
        .json({ error: "Id must be a valid string and an Object Id" });
      return;
    }

    //session user id
    const getData = await parkingsData.getParkingbyUser(
      listerId,
      req.params.id
    );

    let optionVehicleType = "";
    vehicleType.forEach((x) => {
      if (getData.vehicleType.includes(x)) {
        optionVehicleType += `<option selected>${x}</option>`;
      } else {
        optionVehicleType += `<option>${x}</option>`;
      }
    });
    let optionStateList = "";
    stateList.forEach((x) => {
      if (getData.state.includes(x)) {
        optionStateList += `<option selected>${x}</option>`;
      } else {
        optionStateList += `<option>${x}</option>`;
      }
    });

    let optionParkingType = "";
    let parkingTypeArray = ["open", "closed"];
    parkingTypeArray.forEach((x) => {
      if (getData.parkingType.includes(x)) {
        optionParkingType += `<option selected>${x}</option>`;
      } else {
        optionParkingType += `<option>${x}</option>`;
      }
    });

    res.render("pages/parkings/editParkings", {
      partial: "emptyPartial",

      title: "Edit Parking",
      states: optionStateList,
      parkingtype: optionParkingType,
      vehicleType: optionVehicleType,
      data: getData,
      error: false,
    });
  } catch (error) {
    res.status(404).render("pages/parkings/editParkings", {
      partial: "emptyPartial",

      title: "Edit Parking",
      error: true,
      errormsg: "No data found",
    });
  }
});

//get parkings
router.get("/:id", async (req, res) => {
  console.log("parking id: ", req.params.id);
  if (!req.params.id) {
    res.status(400).json({ error: "You must supply a parking Id" });
    return;
  }

  let validId = validate(req.params.id);
  if (!validId) {
    res
      .status(400)
      .json({ error: "Id must be a valid string and an Object Id" });
    return;
  }

  try {
    const getData = await parkingsData.getParking(req.params.id);
    // if (global && global.sessionStorage) {
    sessionStorage.setItem("parkingId", getData._id);
    // }
    res.render("pages/parkings/parkingDetails", {
      partial: "emptyPartial",

      parkdata: getData,
      title: "Parking",
      isReviewer: true,
      userLoggedIn: true,
    });
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

//post parkings route
router.post("/post", upload.single("parkingImg"), async function (req, res) {
  const parkingPostData = req.body;
  if (!parkingPostData.address) {
    res.status(400).json({ error: "You must provide address" });
    return;
  }
  if (!parkingPostData.city) {
    res.status(400).json({ error: "You must provide city" });
    return;
  }
  if (!parkingPostData.state) {
    res.status(400).json({ error: "You must provide state" });
    return;
  }
  if (!parkingPostData.zip) {
    res.status(400).json({ error: "You must provide zip" });
    return;
  }
  if (!parkingPostData.longitude) {
    res.status(400).json({ error: "You must provide longitude" });
    return;
  }
  if (!parkingPostData.latitude) {
    res.status(400).json({ error: "You must provide latitude" });
    return;
  }
  if (!parkingPostData.category) {
    res.status(400).json({ error: "You must provide category" });
    return;
  }
  if (!parkingPostData.parkingType) {
    res.status(400).json({ error: "You must provide parking type" });
    return;
  }

  try {
    let {
      address,
      city,
      state,
      zip,
      longitude,
      latitude,
      category,
      parkingType,
    } = parkingPostData;

    let validateString = validateArguments(
      address,
      city,
      state,
      zip,
      longitude,
      latitude,
      category,
      parkingType
    );

    if (validateString != undefined) {
      res.status(400).json({ error: validateString });
      return;
    }

    if (!req.session.user) {
      return res.redirect("/users/login");
    }

    const listerId = req.session.user.userId;
    let validListerId = validate(listerId);
    if (!validListerId) {
      res
        .status(400)
        .json({ error: "Id must be a valid string and an Object Id" });
      return;
    }

    let parkingImg = !req.file ? "public\\images\\no_image.jpg" : req.file.path;

    //Get geolocation information
    let geoAddress =
      parkingPostData.address +
      "," +
      parkingPostData.city +
      "," +
      parkingPostData.state +
      "," +
      "USA";

    const geocodes = await parkingsData.getcodes(geoAddress);

    geocodes.data.forEach((x) => {
      (longitude = x.longitude), (latitude = x.latitude);
    });

    const postParkings = await parkingsData.createParkings(
      listerId,
      parkingImg,
      address.toLowerCase(),
      city.toLowerCase(),
      state.toUpperCase(),
      zip,
      longitude.toString(),
      latitude.toString(),
      category,
      parkingType.toLowerCase()
    );
    res.render("pages/parkings/createParkings", {
      partial: "emptyPartial",

      title: "Create Parking",
      states: stateList,
      success: true,
    });
    return;
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

//update parkings
router.put("/update", upload.single("parkingImg"), async (req, res) => {
  const updatedData = req.body;
  let validListerId = validate(updatedData.listerId);
  if (!validListerId) {
    res
      .status(400)
      .json({ error: "Lister Id must be a valid string and an Object Id" });
    return;
  }
  if (!req.file) {
    updatedData.parkingImg =
      updatedData.parkingImghidden == ""
        ? "public\\images\\no_image.jpg"
        : updatedData.parkingImghidden;
  } else {
    updatedData.parkingImg = req.file.path;
  }

  if (
    !updatedData.address ||
    !updatedData.city ||
    !updatedData.state ||
    !updatedData.zip ||
    !updatedData.longitude ||
    !updatedData.latitude ||
    !updatedData.category ||
    !updatedData.parkingType
  ) {
    res.status(400).json({ error: "You must supply all fields" });
    return;
  }

  let validateString = validateArguments(
    updatedData.address,
    updatedData.city,
    updatedData.state,
    updatedData.zip,
    updatedData.longitude,
    updatedData.latitude,
    updatedData.category,
    updatedData.parkingType
  );

  if (validateString != undefined) {
    res.status(400).json({ error: validateString });
    return;
  }

  try {
    await parkingsData.getParkingbyUser(
      updatedData.listerId,
      updatedData.parkingId
    );
  } catch (e) {
    res.status(404).render("pages/parkings/editParkings", {
      partial: "editParkings",

      title: "Edit Parking",
      error: true,
      errormsg: e,
    });
    return;
  }
  try {
    let geoAddress =
      updatedData.address +
      "," +
      updatedData.city +
      "," +
      updatedData.state +
      "," +
      "USA";

    const geocodes = await parkingsData.getcodes(geoAddress);

    geocodes.data.forEach((x) => {
      (updatedData.longitude = x.longitude),
        (updatedData.latitude = x.latitude);
    });
  } catch (error) {
    res.status(500).render("pages/parkings/editParkings", {
      title: "Edit Parking",
      partial: "editPartial",

      error: true,
      errormsg: "Internal Server Error",
    });
    return;
  }
  try {
    const updatedParking = await parkingsData.updateParking(
      updatedData.parkingId,
      updatedData.listerId,
      updatedData.parkingImg,
      updatedData.address.toLowerCase(),
      updatedData.city.toLowerCase(),
      updatedData.state.toUpperCase(),
      updatedData.zip,
      updatedData.longitude.toString(),
      updatedData.latitude.toString(),
      updatedData.category,
      updatedData.parkingType.toLowerCase()
    );
    let vehicleType = [
      "sedan",
      "suv",
      "hatchback",
      "station wagon",
      "coupe",
      "minivan",
      "pickup truck",
    ];

    let optionVehicleType = "";
    vehicleType.forEach((x) => {
      if (updatedParking.vehicleType.includes(x)) {
        optionVehicleType += `<option selected>${x}</option>`;
      } else {
        optionVehicleType += `<option>${x}</option>`;
      }
    });
    let optionStateList = "";
    stateList.forEach((x) => {
      if (updatedParking.state.includes(x)) {
        optionStateList += `<option selected>${x}</option>`;
      } else {
        optionStateList += `<option>${x}</option>`;
      }
    });

    let optionParkingType = "";
    let parkingTypeArray = ["open", "closed"];
    parkingTypeArray.forEach((x) => {
      if (updatedParking.parkingType.includes(x)) {
        optionParkingType += `<option selected>${x}</option>`;
      } else {
        optionParkingType += `<option>${x}</option>`;
      }
    });

    res.render("pages/parkings/editParkings", {
      partial: "editPartial",
      title: "Edit Parking",
      error: false,
      data: updatedParking,
      success: true,
      states: optionStateList,
      parkingtype: optionParkingType,
      vehicleType: optionVehicleType,
    });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

//delete parkings
router.delete("/delete/:id", async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: "You must supply a parking Id" });
    return;
  }
  let validResult = validate(req.params.id);
  if (!validResult) {
    res
      .status(400)
      .json({ error: "Id must be a valid string and an Object Id" });
    return;
  }
  try {
    const listerId = req.session.user.userId;
    let validListerId = validate(listerId);
    if (!validListerId) {
      res
        .status(400)
        .json({ error: "Id must be a valid string and an Object Id" });
      return;
    }

    //session user id
    const getData = await parkingsData.getParkingbyUser(
      listerId,
      req.params.id
    );

    const deleteData = await parkingsData.deleteParking(req.params.id);
    res.render("pages/parkings/getParkings", {
      partial: "emptyPartial",

      title: "My Parkings",
      success: true,
      successmsg: `<div class="container alert alert-success"><p class="empty">Parking Deleted</p></div>`,
    });
  } catch (error) {
    res.status(404).json({ message: "Data not found " });
  }
});

function validate(id) {
  if (typeof id != "string") {
    return false;
  } else if (id.trim().length === 0) {
    return false;
  } else if (!ObjectId.isValid(id)) {
    return false;
  } else return true;
}

//validate inputs
function validateArguments(
  address,
  city,
  state,
  zip,
  longitude,
  latitude,
  category,
  parkingType
) {
  const zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
  var longLatRegex = new RegExp("^-?([1-8]?[1-9]|[1-9]0).{1}d{1,6}");

  //string and trim length checks
  //      typeof parkingImg != "string" ||

  if (
    typeof address != "string" ||
    typeof city != "string" ||
    typeof state != "string"
  ) {
    return "Parameter of defined type not found";
    //        parkingImg.length === 0 ||
  } else if (address.length === 0 || city.length === 0 || state.length === 0) {
    return "Parameter cannot be blank spaces or empty values";
  }

  //state validator
  if (typeof state === "string") {
    if (stateList.indexOf(state) == -1) {
      return "State not found";
    }
  }

  //zip code validator
  if (!zipRegex.test(zip)) {
    return "Incorrect zip code";
  }
  // commented for now
  //   if (typeof longitude != "number" || typeof latitude != "number") {
  //     throw "longitude and latitude should be numbers";
  //   }

  //vehicletype validator
  if (Array.isArray(category) && category.length >= 1) {
    const isString = (x) => typeof x == "string" && x.trim().length != 0;
    if (!category.every(isString)) {
      return "vehicletype must contain strings!";
    }
    category = category.map((X) => X.toLowerCase());
    if (!vehicleType.includes(...category)) {
      return "vehicle type must contain values from dropdown";
    }
  } else {
    return "vehicletype must be an array having atleast 1 string!";
  }

  //parkingtype validator
  if (
    !parkingType.toLowerCase() === "open" ||
    !parkingType.toLowerCase() === "closed"
  ) {
    throw "Parking type only accepts open and closed as values";
  }
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
const vehicleType = [
  "sedan",
  "suv",
  "hatchback",
  "station wagon",
  "coupe",
  "minivan",
  "pickup truck",
];

module.exports = router;
