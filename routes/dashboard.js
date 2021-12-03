const express = require("express");
const router = express.Router();
const parkingsData = require("../data/parkings");

router.get("/", (req, res) => {
  try {
    res.render("pages/dashboard", {
      title: "My Parking Assistant",
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
