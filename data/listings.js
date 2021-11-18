const { listings } = require("./../config/mongoCollections");
const { ObjectId } = require("mongodb");
const common  = require("./common");

let exportedMethods = {

    // Adding listers state here for validation of vehicle number plate according to state
    async createListing(startDate, endDate, startTime, endTime, price) {
        let booked = false;
        let bookerId = null;
        let numberPlate = null;
        if (
            !bookerId ||
            !startDate ||
            !endDate ||
            !startTime ||
            !endTime ||
            !booked ||
            !numberPlate ||
            !price
          ) {
            throw `Missing parameter`;
          }

          common.checkInputDate(startDate);
          common.checkInputDate(endDate);
          common.checkInputTime(startTime);
          common.checkInputTime(endTime);
          common.checkIsProperNumber(price);
          
          let newListing = {
            startDate: startDate,
            endDate: endDate,
            startTime: startTime,
            endTime: endTime,
            price: price,
            booked: booked,
            bookerId: bookerId,
            numberPlate: numberPlate
          }

          const listingsCollection = await listings();
          const insertInfo = await listingsCollection.insertOne(newListing);
          if(insertInfo.insertedCount === 0) throw `Could not add listing.`

          return newListing;
    },

    // Adding state here for validation of vehicle number plate according to state
    // Should pass lister Id as well to get all the listings under his ID
    async listingDetail(bookerId, startDate, endDate, startTime, endTime, booked, numberPlate, price) {
      if (
        !bookerId ||
        !startDate ||
        !endDate ||
        !startTime ||
        !endTime ||
        !booked ||
        !numberPlate ||
        !price
      ) {
        throw `Missing parameter`;
      }

      common.checkIsProperString(bookerId);
      common.checkInputDate(startDate);
      common.checkInputDate(endDate);
      common.checkInputTime(startTime);
      common.checkInputTime(endTime);
      common.checkIsProperBoolean(booked);
      common.checkIsProperNumber(price);

      // Pending: numberPlate validation according to state

      const listingsCollection = await listings();

    }
};

module.exports = exportedMethods;