const userRoutes = require("./users");

const constructorMethod = (app) => {
  app.use("/users", userRoutes);
  app.use("*", (req, res) => {
    res.status(200).json({ thingIs: "Ye banana baaki hai" });
  });
};

module.exports = constructorMethod;
