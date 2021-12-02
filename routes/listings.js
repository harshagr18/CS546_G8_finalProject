const express = require("express");
const router = express.Router();
const listingsData = require("../data/listings");
const usersData = require("../data/users");
const common = require("../data/common");
let { ObjectId } = require("mongodb");
const session = require("express-session");

// Pending: Change the render page url for all
router.post("/createListing", async (req, res) => {
  const requestBody = req.body;
  let listerId;
  // let listerCarCategory;

  // Pending: Testing
  // user id will be in session
  // make a db call to get the lister id from user id

  try {
    const userData = await usersData.getUser(req.session.user);
    listerId = userData.listerId.toString();
    // listerCarCategory = userData.category.vehicleType;
  } catch (e) {
    res.status(400).render("users/login", { error: e });
  }

  let startDate = requestBody.startDate;
  let endDate = requestBody.endDate;
  let startTime = requestBody.startTime;
  let endTime = requestBody.endTime;
  let price = requestBody.price;

  try {
    if (
      !listerId ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      !price
    ) {
      throw `Missing parameter`;
    }

    common.checkObjectId(listerId);
    // var today = new Date();
    // common.checkInputDate(startDate, endDate);
    common.checkInputDate(startDate);
    common.checkInputDate(endDate);
    // common.checkInputTime(startTime, endTime);
    common.checkInputTime(startTime);
    common.checkInputTime(endTime);
    common.checkIsProperNumber(price);
  } catch (e) {
    res.status(400).render("users/login", { error: e });
    return;
  }

  try {
    const data = await listingsData.createListing(
      listerId,
      startDate,
      endDate,
      startTime,
      endTime,
      price
    );
    // if (!data) {
    //   res
    //     .status(404)
    //     .render("users/login", { error: "Error 404 :No data found." });
    //   return;
    // }
    res.render("users/login", { data: data, title: "Create Listing" });
  } catch (e) {
    res.status(400).render("users/login", { error: e });
  }
});

router.get("/getAllListing", async (req, res) => {
  let listerId;
  try {
    const userData = await usersData.getUser(req.session.user);
    listerId = userData.listerId.toString();
  } catch (e) {
    res.status(400).render("users/login", { error: e });
  }

  try {
    if (!listerId) throw `Missing parameter`;
    common.checkObjectId(listerId);
  } catch (e) {
    res.status(400).render("users/login", { error: e });
    return;
  }

  try {
    const data = await listingsData.getAllListings(listerId);
    if (!data) {
      res
        .status(404)
        .render("users/login", { error: "Error 404 :No data found." });
      return;
    }
    res.render("users/login", { data: data, title: "Create Listing" });
  } catch (e) {
    res.status(400).render("users/login", { error: e });
  }
});

router.get("/getListing/:id", async (req, res) => {
  try {
    const data = await listingsData.getListing(req.params.id);
    if (!data) {
      res
        .status(404)
        .render("users/login", { error: "Error 404 :No data found." });
      return;
    }
    res.render("users/login", { data: data, title: "Create Listing" });
  } catch (e) {
    res.status(400).render("users/login", { error: e });
  }
});

router.delete("/removeListing/:id", async (req, res) => {
  try {
    const data = await listingsData.removeListing(req.params.id);
    res.render("users/login", { data: data, title: "Create Listing" });
  } catch (e) {
    res.status(400).render("users/login", { error: e });
  }
});

router.put("/updateByLister/:id", async (req, res) => {
  const requestBody = req.body;
  let listerId;

  try {
    const userData = await usersData.getUser(req.session.user);
    listerId = userData.listerId.toString();
  } catch (e) {
    res.status(400).render("users/login", { error: e });
  }

  let startDate = requestBody.startDate;
  let endDate = requestBody.endDate;
  let startTime = requestBody.startTime;
  let endTime = requestBody.endTime;
  let price = requestBody.price;

  // Pending: error handling for params that are not null, i.e. 
  // whose values has been passed to be updated rest can be ignored
  try {
    const data = await listingsData.updateListingByLister(
      listerId,
      req.params.id,
      startDate,
      endDate,
      startTime,
      endTime,
      //   userCarCategory,
      price
    );
    res.render("users/login", { data: data, title: "Create Listing" });
  } catch (e) {
    res.status(400).render("users/login", { error: e });
  }
});

// router.put("/updateByUser/:id", async (req, res) => {
//     const requestBody = req.body;
//     let listerId;

//     try {
//       const userData = await usersData.getUser(req.session.user);
//       listerId = userData.listerId.toString();
//     } catch (e) {
//       res.status(400).render("users/login", { error: e });
//     }

//     let startDate = requestBody.startDate;
//     let endDate = requestBody.endDate;
//     let startTime = requestBody.startTime;
//     let endTime = requestBody.endTime;
//     let price = requestBody.price;

//     try {
//       const data = await listingsData.updateListingByLister(
//         listerId,
//         req.params.id,
//         startDate,
//         endDate,
//         startTime,
//         endTime,
//         //   userCarCategory,
//         price
//       );
//       res.render("users/login", { data: data, title: "Create Listing" });
//     } catch (e) {
//       res.status(400).render("users/login", { error: e });
//     }
//   });

module.exports = router;
