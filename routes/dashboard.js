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
      authenticated: authenticated,
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
  const apikey = settings.apikey;

  let hasErrors = false;
  if (!citySearch && !zipSearch && !stateSearch) {
    res.status(400).render("pages/dashboard", {
      title: "My Parking Assistant",
      hasErrors: true,
      error: "Expected at least one parameter",
    });
    return;
  }
  try {
    const getData = await parkingsData.getParkingsByCityStateZip(
      citySearch,
      stateSearch,
      zipSearch
    );
    //const distance = await parkingsData.getDistance("abc", "pqr");
    console.log(distance);
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
      title: "My Parking Assistant",
      citySearch: citySearch,
      stateSearch: stateSearch,
      zipSearch: zipSearch,
    });
    return;
  } catch (error) {
    res.status(404).json({ message: "Page not found" });
  }
});

module.exports = router;
