const express = require("express");
const router = express.Router();
const data = require("../data");
const userData = data.users;
const parkingData = data.parkings;
const { ObjectId } = require("mongodb");

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

function validate(id) {
  if (typeof id != "string") {
    return false;
  } else if (id.trim().length === 0) {
    return false;
  } else if (!ObjectId.isValid(id)) {
    return false;
  } else return true;
}

router.post("/createUser", async (req, res) => {
  let userInfo = req.body;
  console.log(userInfo);
  try {
    const newUser = await userData.createUser(
      userInfo.firstName,
      userInfo.lastName,
      userInfo.email,
      userInfo.phoneNumber,
      userInfo.username,
      userInfo.password,
      userInfo.address,
      userInfo.city,
      userInfo.state,
      userInfo.zip
    );
    res.redirect("/users/login");
  } catch (e) {
    console.log(e);
    res.render("pages/users/createUsers", {
      error: e,
      title: "Create Profile",
      states: stateList,
    });
  }
});

router.get("/logout", async (req, res) => {
  req.session.destroy();
  res.redirect("/users/login");
});

router.post("/login", async (req, res) => {
  try {
    let userInfo = req.body;
    let user = await userData.checkUser(userInfo.username, userInfo.password);
    req.session.user = { username: user.username, userId: user._id.toString() };
    res.redirect("/");
  } catch (e) {
    console.log(e);
    res
      .status(400)
      .render("pages/users/login", { title: "Create Profile", error: e });
  }
});

router.get("/updateUser/:id", async (req, res) => {
  try {
    let validId = validate(req.params.id);
    if (!validId) {
      res.status(400).json({ error: "Id must be valid" });
      return;
    }
    getData = await userData.getUser(req.params.id.toString());
    res.render("pages/users/editUser", {
      title: "Edit Profile",
      states: stateList,
      data: getData,
    });
    return;
  } catch (e) {
    console.log(e);
    res.status(404).json({ error: "Internal error" });
  }
});

router.post("/updateUser/:id", async (req, res) => {
  try {
    const userInfo = req.body;
    updatedUser = await userData.updateUser(
      req.params.id.toString(),
      userInfo.firstName,
      userInfo.lastName,
      userInfo.email,
      userInfo.phoneNumber,
      userInfo.username,
      userInfo.password,
      userInfo.address,
      userInfo.city,
      userInfo.state,
      userInfo.zip
    );
    res.redirect("/");
  } catch (e) {
    console.log(e);
    res
      .status(400)
      .render("pages/users/editUser", { title: "Edit Profile", error: e });
  }
});

router.get("/createProfile", async (req, res) => {
  try {
    res.render("pages/users/createUsers", {
      title: "Create Profile",
      states: stateList,
    });
  } catch (e) {
    console.log(e);
    res.status(404).json({ error: "Internal error" });
  }
});

router.get("/login", async (req, res) => {
  try {
    res.render("pages/users/login", { title: "Login" });
  } catch (e) {
    console.log(e);
    res.status(404).json({ error: "Internal Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    let user = await userData.getUser(req.params.id);
    let parkings = await parkingData.getParkingsOfLister(req.params.id);
    console.log(parkings);
    res.render("pages/users/getUsers", {
      user: user,
      title: "My Profile",
      parkings: parkings,
    });
    return;
  } catch (e) {
    console.log(e);
    res.status(404).json({ error: "User not found" });
  }
});

router.delete("/:id", async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: "You must supply a user Id" });
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
    const deleteData = await userData.deleteUser(req.params.id);
    res.json(deleteData);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Data not found " });
  }
});

module.exports = router;
