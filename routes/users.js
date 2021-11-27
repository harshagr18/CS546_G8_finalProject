const express = require("express");
const router = express.Router();
const data = require("../data");
const userData = data.users;

function validate(id) {
  if (typeof id != "string") {
    return false;
  } else if (id.trim().length === 0) {
    return false;
  } else if (!ObjectId.isValid(id)) {
    return false;
  } else return true;
}

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

router.put("/:id", async (req, res) => {
  const userInfo = req.body;
  let validId = validate(req.params.id);
  if (!validId) {
    res
      .status(400)
      .json({ error: "Id must be a valid string and an Object Id" });
    return;
  }
  let validUserId = validate(userInfo.userId);
  if (!validUserId) {
    res
      .status(400)
      .json({ error: "Lister Id must be a valid string and an Object Id" });
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
    res.status(404).json({ message: "Data not found " });
  }
});

module.exports = router;
