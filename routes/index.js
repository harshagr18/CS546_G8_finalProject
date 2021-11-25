const parkingsRoutes = require('./parkings');
const listingsRoutes = require('./listings');

const constructerMethod = (app) => {
    app.use('/parkings', parkingsRoutes);
    app.use('/listings', listingsRoutes);

    app.use('*', (req, res) => {
        res.status(404).json({error : 'Not Found'});
    });
};

module.exports = constructerMethod;