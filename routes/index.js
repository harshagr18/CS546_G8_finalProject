const parkingRoutes = require("./parkings");

//added by sv
const constructorMethod = (app) => {
  app.use("/parkings", parkingRoutes);

  app.use("*", (req, res) => {
    res.status(404).json({ error: "Path Not Found" });
  });
};

module.exports = constructorMethod;
