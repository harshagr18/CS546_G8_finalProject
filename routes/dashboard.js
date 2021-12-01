const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  try {
    res.render("pages/dashboard", {
      title: "My Parking Assistant",
    });
  } catch (error) {
    res.status(404).json({ message: "Page not found" });
  }
});

module.exports = router;
