const express = require("express");
const router = express.Router();
const { ObjectId } = require("bson");
const parkingsData = require("../data/parkings");
const path = require("path");

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
  storage: storage,
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

    let vehicleType = [
      "sedan",
      "suv",
      "hatchback",
      "station wagon",
      "coupe",
      "minivan",
      "pickup truck",
    ];
    const filteredArray = vehicleType.filter((value) =>
      getData.vehicleType.includes(value)
    );
    let option = {};

    vehicleType.forEach((x) => {
      filteredArray.forEach((y) => {
        if (x == y) {
          option[x] = true;
        } else {
          option[x] = false;
        }
      });
    });

    res.render("pages/parkings/editParkings", {
      title: "Edit Parking",
      states: stateList,
      data: getData,
      parkingType: getData.parkingType,
      vehicleType: option,
      error: false,
    });
  } catch (error) {
    res.status(404).render("pages/parkings/editParkings", {
      title: "Edit Parking",
      error: true,
      errormsg: "No data found",
    });
  }
});

//get parkings
router.get("/:id", async (req, res) => {
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
    res.json(getData);
  } catch (error) {
    res.status(404).json({ message: "Data not found " });
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
    const {
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

    let parkingImg = req.file.path;
    const postParkings = await parkingsData.createParkings(
      listerId,
      parkingImg,
      address.toLowerCase(),
      city.toLowerCase(),
      state.toUpperCase(),
      zip,
      longitude,
      latitude,
      category,
      parkingType.toLowerCase()
    );
    res.render("pages/parkings/createParkings", {
      title: "Create Parking",
      states: stateList,
      success: true,
    });
    return;
    //return res.status(200).json(postParkings);
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
    updatedData.parkingImg = updatedData.parkingImghidden;
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
      title: "Edit Parking",
      error: true,
      errormsg: e,
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
      updatedData.longitude,
      updatedData.latitude,
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
    const filteredArray = vehicleType.filter((value) =>
      updatedParking.category.includes(value)
    );
    let option = {};

    vehicleType.forEach((x) => {
      filteredArray.forEach((y) => {
        if (x == y) {
          option[x] = true;
        } else {
          option[x] = false;
        }
      });
    });

    res.render("pages/parkings/editParkings", {
      title: "Edit Parking",
      error: false,
      data: updatedParking,
      success: true,
      parkingType: updatedParking.parkingType,
      vehicleType: option,
    });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

//delete parkings
router.delete("/:id", async (req, res) => {
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
    const deleteData = await parkingsData.deleteParking(req.params.id);
    res.json(deleteData);
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
  // if (Array.isArray(category) && category.length >= 1) {
  //   const isString = (x) => typeof x == "string" && x.trim().length != 0;
  //   if (!category.every(isString)) {
  //     return "vehicletype must contain strings!";
  //   }
  // } else {
  //   return "vehicletype must be an array having atleast 1 string!";
  // }

  //parkingtype validator
  if (
    !parkingType.toLowerCase() === "open" ||
    !parkingType.toLowerCase() === "close"
  ) {
    throw "Parking type only accepts open and close as values";
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
module.exports = router;
