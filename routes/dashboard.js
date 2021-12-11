const express = require("express");
const router = express.Router();
const parkingsData = require("../data/parkings");
const settings = require("../config/settings.json");

router.get("/", (req, res) => {
  try {
    let authenticated = true;
    if (!req.session.user) {
      authenticated = false;
    }
    res.render("pages/dashboard", {
      title: "My Parking Assistant",
      session: req.session.user.userId,
      authenticated: authenticated,
      states: stateList,
      partial: "emptyPartial",
    });
  } catch (error) {
    res.status(404).json({ message: "Page not found" });
  }
});

//get the search parkings by zipcode/state
router.post("/search", async (req, res) => {
  let citySearch = req.body.citySearch;
  let zipSearch = req.body.zipSearch;
  let stateSearch = req.body.stateSearch;
  let parkingType = req.body.parkingType;

  if (stateSearch === "Select State") {
    stateSearch = "";
  }
  if (parkingType === "Select Type") {
    parkingType = "";
  }
  const apikey = settings.apikey;
  if (apikey == "" || apikey == undefined) {
    res.status(404).json({ message: "Google Maps API key not found" });
  }

  let hasErrors = false;
  if (!citySearch && !zipSearch && !stateSearch) {
    res.status(400).render("pages/dashboard", {
      title: "My Parking Assistant",
      session: req.session.user.userId,
      hasErrors: true,
      error: "Expected at least one parameter",
      partial: "emptyPartial",
      states: stateList,
    });
    return;
  }

  let validateString = validateArguments(
    citySearch,
    stateSearch,
    zipSearch,
    parkingType
  );
  if (validateString != undefined) {
    res.status(400).render("pages/dashboard", {
      title: "My Parking Assistant",
      session: req.session.user.userId,
      hasErrors: true,
      error: validateString,
      partial: "emptyPartial",
      states: stateList,
    });
    return;
  }

  try {
    const getData = await parkingsData.getParkingsByCityStateZip(
      citySearch,
      stateSearch,
      zipSearch,
      parkingType
    );
    //const distance = await parkingsData.getDistance("abc", "pqr");
    //console.log(distance);
    getData.forEach((x) => {
      let address =
        x.address.replace(/\s/g, "+") +
        "+" +
        x.city.replace(/\s/g, "+") +
        "+" +
        x.state +
        "+" +
        x.zip +
        "USA";
      x["mapUrl"] =
        "https://www.google.com/maps/embed/v1/search?q=" +
        address +
        "&key=" +
        apikey;
    });

    res.render("pages/dashboard", {
      listingsData: getData,
      session: req.session.user.userId,
      title: "My Parking Assistant",
      citySearch: citySearch,
      stateSearch: stateSearch,
      zipSearch: zipSearch,
      partial: "emptyPartial",
      states: stateList,
    });
    return;
  } catch (error) {
    res.status(404).json({ message: "Page not found" });
  }
});

function validateArguments(city, state, zip, parkingType) {
  const zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;

  if (
    typeof city != "string" ||
    typeof state != "string" ||
    typeof zip != "string"
  ) {
    return "Parameter of defined type not found";
  }
  // if (
  //   city.trim().length === " " ||
  //   state.trim().length === 0 ||
  //   zip.trim().length === 0
  // ) {
  //   return "Parameter cannot be blank spaces or empty values";
  // }

  //state validator

  if (state != "") {
    if (stateList.indexOf(state) == -1) {
      return "State not found";
    }
  }

  //zip code validator
  if (zip != "")
    if (!zipRegex.test(zip)) {
      return "Incorrect zip code";
    }

  //parkingtype validator
  if (
    !parkingType.toLowerCase() === "open" ||
    !parkingType.toLowerCase() === "closed"
  ) {
    return "Parking type only accepts open and closed as values";
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
