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
    // if (req.session.username) {
    //   return res.redirect("/private");
    // }

    //username calls user table and fetches lister id to get parkings from logged in user
    //hardcoded for testing
    const getData = await parkingsData.getParkingsOfLister(
      "6164f085181bfcb0325557c7"
    );
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
  if (!parkingPostData.listerId) {
    res.status(400).json({ error: "You must provide lister Id" });
    return;
  }
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
  try {
    const {
      listerId,
      address,
      city,
      state,
      zip,
      longitude,
      latitude,
      category,
    } = parkingPostData;

    let validListerId = validate(listerId);
    if (!validListerId) {
      res
        .status(400)
        .json({ error: "Id must be a valid string and an Object Id" });
      return;
    }

    let validateString = validateArguments(
      address,
      city,
      state,
      zip,
      longitude,
      latitude,
      category
    );

    if (validateString != undefined) {
      res.status(400).json({ error: validateString });
      return;
    }

    let parkingImg = req.file.path;
    const postParkings = await parkingsData.createParkings(
      listerId,
      parkingImg,
      address,
      city,
      state,
      zip,
      longitude,
      latitude,
      category
    );

    return res.status(200).json(postParkings);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

//update parkings
router.put("/:id", async (req, res) => {
  const updatedData = req.body;
  let validId = validate(req.params.id);
  if (!validId) {
    res
      .status(400)
      .json({ error: "Id must be a valid string and an Object Id" });
    return;
  }
  let validListerId = validate(updatedData.listerId);
  if (!validListerId) {
    res
      .status(400)
      .json({ error: "Lister Id must be a valid string and an Object Id" });
    return;
  }

  if (
    !updatedData.listerId ||
    !updatedData.parkingImg ||
    !updatedData.address ||
    !updatedData.city ||
    !updatedData.state ||
    !updatedData.zip ||
    !updatedData.longitude ||
    !updatedData.latitude ||
    !updatedData.category
  ) {
    res.status(400).json({ error: "You must supply all fields" });
    return;
  }
  let validateString = validateArguments(
    updatedData.parkingImg,
    updatedData.address,
    updatedData.city,
    updatedData.state,
    updatedData.zip,
    updatedData.longitude,
    updatedData.latitude,
    updatedData.category
  );

  if (validateString != undefined) {
    res.status(400).json({ error: validateString });
    return;
  }

  try {
    await parkingsData.getParking(req.params.id);
  } catch (e) {
    res.status(404).json({ error: "Parking not found" });
    return;
  }

  try {
    const updatedParking = await parkingsData.updateParking(
      req.params.id,
      updatedData.listerId,
      updatedData.parkingImg,
      updatedData.address,
      updatedData.city,
      updatedData.state,
      updatedData.zip,
      updatedData.longitude,
      updatedData.latitude,
      updatedData.category
    );
    res.json(updatedParking);
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
  category
  // parkingReviews
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

  //vehicle type validator
  // if (typeof category === "object") {
  //   if (
  //     Array.isArray(category.vehicleType) &&
  //     category.vehicleType.length > 0
  //   ) {
  //     const isString = (x) => typeof x == "string" && x.trim().length != 0;
  //     if (!category.vehicleType.every(isString)) {
  //       return "Vehicle type must be a string";
  //     }
  //   } else return "Vehicle type must be array of length atleast 1";
  // } else return "Category must be an object";

  // if (Array.isArray(parkingReviews)) {
  //   parkingReviews.forEach((x) => {
  //     if (typeof x != "string") throw "review id must be a string";
  //     if (x.trim().length === 0) throw "review id cannot be empty or blanks";
  //     if (!ObjectId.isValid(id)) throw "Object Id is not valid";
  //   });
  // }
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
