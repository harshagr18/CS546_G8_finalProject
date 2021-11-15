const express = require("express");
const router = express.Router();
const data = require("../data");
const userData = data.users;

router.post("/", async (req, res) => {
  let userInfo = req.body;

  try {
    const newUser = await userData.createUser(
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
    res.json(newUser);
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: "Improper data" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    let user = await userData.getUser(req.params.id);
    res.json(user);
  } catch (e) {
    console.log(e);
    res.status(404).json({ error: "User not found" });
  }
});

router.get("/", async (req, res) => {
  let userInfo = req.body;

  res.status(200).json({ test: "Success" });
});

module.exports = router;
