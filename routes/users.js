const express = require("express");
const router = express.Router();
const data = require("../data");
const userData = data.users;
const { ObjectId } = require("mongodb");
const { getUser } = require("../data/users");

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
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    let userInfo = req.body;
    let user = await userData.checkUser(userInfo.username, userInfo.password);
    req.session.user = { username: user.username, userId: user._id.toString() };
    res.redirect("/");
  } catch (e) {
    console.log(e);
    res.status(400).render("pages/users/login", { error: e });
  }
});

router.get("/createProfile", async (req, res) => {
  try {
    res.render("pages/users/createUsers", { title: "Create Profile" });
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
    res.render("pages/users/getUsers", { user: user, title: "My Profile" });
    return;
  } catch (e) {
    console.log(e);
    res.status(404).json({ error: "User not found" });
  }
});

router.put("/:id", async (req, res) => {
  const userInfo = req.body;
  let validId = validate(req.params.id);
  if (!validId) {
    res
      .status(400)
      .json({ error: "Id must be a valid string and an Object Id" });
    return;
  }

  try {
    await userData.getUser(req.params.id);
  } catch (e) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  try {
    const updatedUser = await userData.updateUser(
      req.params.id,
      userInfo.firstName,
      userInfo.lastName,
      userInfo.email,
      userInfo.phoneNumber,
      userInfo.username,
      userInfo.address,
      userInfo.city,
      userInfo.state,
      userInfo.zip
    );
    res.json(updatedUser);
  } catch (e) {
    res.status(500).json({ error: e });
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
