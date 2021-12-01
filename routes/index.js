const reviewRoutes = require('./parkingReviews');

const constructorMethod = (app) => {
    app.use ('/reviews', reviewRoutes);

    app.use("*", (req, res) => {
        res.status(404).json({error: "Path not found"});
    });
};

module.exports = constructorMethod;