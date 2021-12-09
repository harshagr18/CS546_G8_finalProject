const express = require("express");
const router = express.Router();
const listingsData = require("../data/listings");
const usersData = require("../data/users");
const common = require("../data/common");
let { ObjectId } = require("mongodb");
const session = require("express-session");
const sessionStorage = require("sessionstorage");
// const window = require("window");

router.get("/createListingPage", async (req, res) => {
  try {
    res.render("pages/parkings/createListing", {
      partial: "emptyPartial",
      session: req.session.user,
    });
  } catch (e) {}
});

// Pending: Change the render page url for all
router.post("/createListing", async (req, res) => {
  // Body empty issue resolved by removing enctype in form
  const requestBody = req.body;
  let listerId;
  // let listerCarCategory;

  // Pending: Testing
  // user id will be in session
  // make a db call to get the lister id from user id

  listerId = sessionStorage.getItem("parkingId");

  let startDate = requestBody.startDate;
  let endDate = requestBody.endDate;
  let startTime = requestBody.startTime;
  let endTime = requestBody.endTime;
  let price = parseInt(requestBody.price);

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
    res.status(400).render("pages/parkings/createListing", {
      partial: "emptyPartial",
      session: req.session.user,
      error: e,
    });
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
    res.render("pages/parkings/createListing", {
      partial: "emptyPartial",
      session: req.session.user,
      data: data,
      title: "Create Listing",
    });
  } catch (e) {
    res.status(400).render("pages/parkings/createListing", {
      error: e,
      session: req.session.user,
    });
  }
});

router.get("/getAllListing", async (req, res) => {
  let listerId;
  try {
    const userData = await usersData.getUser(req.session.user.userId);
    listerId = userData.listerId.toString();
  } catch (e) {
    res
      .status(400)
      .render("users/login", { error: e, partial: "emptyPartial" });
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
      res.status(404).render("users/login", {
        partial: "emptyPartial",
        error: "Error 404 :No data found.",
      });
      return;
    }
    res.render("users/login", {
      partial: "emptyPartial",
      data: data,
      title: "Create Listing",
    });
  } catch (e) {
    res.status(400).render("users/login", { error: e });
  }
});

// Pending: List out only the slots whose booked value is 'false'
// if slot is available for 2 hours and user booked it only for 1 hr then list out
// new slot in the list as well with the available time
router.get("/getListing/:id", async (req, res) => {
  console.log("listing id: ", req.params.id);
  try {
    const data = await listingsData.getListing(req.params.id);
    if (!data) {
      res.status(404).render("pages/parkings/listingDetail", {
        error: "Error 404 :No data found.",
      });
      return;
    }
    res.render("pages/parkings/listingDetail", {
      partial: "emptyPartial",
      data: data,
      title: "Book Listing",
    });
  } catch (e) {
    res.status(400).render("pages/parkings/listingDetail", { error: e });
  }
});

//Pending: pop up to ask if they are sure to delete listing
router.delete("/removeListing/:id", async (req, res) => {
  try {
    // Window.confirm("Are you sure?");
    // if (confirm("Are you sure?")) {
    // txt = "Yes";
    // try {
    const data = await listingsData.removeListing(req.params.id);
    res.render("pages/parkings/listings", {
      partial: "emptyPartial",
      data: data,
      title: "Create Listing",
    });
    // } catch (e) {
    //   res.status(400).render("users/login", { error: e });
    // }
    // } else {
    //   // txt = "No";
    //   return;
    // }
  } catch (e) {
    res.status(400).render("users/login", { error: e });
  }
});

router.get("/updateListing/:id", async (req, res, next) => {
  try {
    sessionStorage.setItem("listingId", req.params.id);
    res.render("pages/parkings/listingUpdate", {
      partial: "emptyPartial",
      id: req.params.id,
      title: "Update Listing",
    });

    // next();
  } catch (e) {
    res.status(400).render("pages/parkings/listingUpdate", {
      partial: "emptyPartial",
      error: e,
    });
    // next();
    // res.status(400).send({ error: e });
  }
});

router.put("/updateListingData/:id", async (req, res) => {
  const requestBody = req.body;
  let listerId;
  console.log("user in session", req.session.user.userId);
  listerId = sessionStorage.getItem("parkingId");

  let startDate = requestBody.startDate;
  let endDate = requestBody.endDate;
  let startTime = requestBody.startTime;
  let endTime = requestBody.endTime;
  let price = parseInt(requestBody.price);

  // Pending: error handling for params that are not null, i.e.
  // whose values has been passed to be updated rest can be ignored
  try {
    // if (listerId == req.session.user.userId) { // update by lister
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
    res.render("pages/parkings/listingUpdate", {
      partial: "emptyPartial",
      data: data,
      title: "Create Listing",
    });
    return;
    // } else if(false) {
    //   // update by user
    // } else {
    //   res.render("pages/parkings/listingUpdate", {
    //     errorMessage: "Cannot update the parking.",
    //   });
    //   return;
    // }
  } catch (e) {
    res.status(400).render("pages/parkings/listingUpdate", {
      partial: "emptyPartial",
      error: e,
    });
  }
});

router.put("/bookListing/:id", async (req, res) => {
  const requestBody = req.body;
  let listerId;
  let listingId = req.params.id;
  // Pending: get bookerId and number plate from req and send
  // it to book listing db function to add in db

  console.log("user session data", req.session.user.userId);
  listerId = sessionStorage.getItem("parkingId");

  // Pending: error handling for params that are not null, i.e.
  // whose values has been passed to be updated rest can be ignored
  try {
    // if (listerId != req.session.user.userId) {
    const data = await listingsData.bookListing(
      listerId,
      listingId
      // , bookerId, numberPlate
    );
    res.render("pages/parkings/listingDetail", {
      partial: "emptyPartial",
      data: data,
      title: "Listing Detail",
    });
    return;
    // } else {
    //   res.render("pages/parkings/listing", {
    //     errorMessage: "Lister cannot book the parking.",
    //   });
    //   return;
    // }
  } catch (e) {
    res.status(400).render("pages/parkings/listingDetail", {
      partial: "emptyPartial",
      error: e,
    });
  }
});

// router.put("/updateByUser/:id", async (req, res) => {
//     const requestBody = req.body;
//     let listerId;

//     try {
//       const userData = await usersData.getUser(req.session.user.userId);
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
