const express = express.Router();
const parkingsData = require("../data/parkings");
const resize = require("../data/resizeImage");

router.get();

//post parkings route
router.post("/post", upload.single("image"), async function (req, res) {
  const imgPath = path.join(__dirname, "/public/images");

  try {
    const fileUpload = new resize(imgPath);
    if (!req.file) {
      res.status(401).json({ error: "Please provide an image" });
    }
    const filename = await fileUpload.save(req.file.buffer);
    return res.status(200).json({ name: filename });
  } catch (error) {}
});

module.exports = router;