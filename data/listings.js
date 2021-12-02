const { parkings } = require("./../config/mongoCollections");
const { ObjectId } = require("mongodb");
const common = require("./common");
const parkingsData = require("./parkings");

let exportedMethods = {
  async createListing(listerId, startDate, endDate, startTime, endTime, price) {
    let booked = false;
    let bookerId = null;
    let numberPlate = null;
    let userCarCategory = null;
    if (
      !listerId ||
      // !bookerId ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      // !booked ||
      // !numberPlate ||
      !price
    ) {
      throw `Missing parameter`;
    }

    common.checkIsProperString(listerId);
    // var today = new Date();
    // common.checkInputDate(startDate, endDate);
    common.checkInputDate(startDate);
    common.checkInputDate(endDate);
    // common.checkInputTime(startTime, endTime);
    common.checkInputTime(startTime);
    common.checkInputTime(endTime);
    common.checkIsProperNumber(price);
    // if(booked == true)
    //   common.checkNumberPlate(numberPlate);
    // common.checkIsProperString(userCarCategory);

    let newListing = {
      _id: ObjectId(),
      startDate: startDate,
      endDate: endDate,
      startTime: startTime,
      endTime: endTime,
      price: price,
      booked: booked,
      bookerId: bookerId,
      numberPlate: numberPlate,
      userCarCategory: userCarCategory,
    };

    const parkingsCollection = await parkings();
    let constParkingId = await parkingsCollection.findOne({
      _id: ObjectId(listerId),
    });

    if (constParkingId === null) throw `No parking with that id.`;

    const addListing = {
      listing: newListing,
    };

    const listingAdded = await parkingsCollection.updateOne(
      { _id: ObjectId(listerId) },
      { $addToSet: addListing }
    );
    if (!listingAdded.acknowledged == true)
      throw `Could not add listing for the parking.`;
    else {
      let createdListing = await parkingsData.getParking(listerId);
      createdListing = common.convertObjectIdToString(createdListing);
      let createdListingArr = [];
      for (let listingsData of createdListing.listing) {
        listingsData = common.convertObjectIdToString(listingsData);
        createdListingArr.push(listingsData);
      }
      createdListing.listing = createdListingArr;
      return createdListing;
    }

    // const insertInfo = await parkingsCollection.insertOne(newListing);
    // if(insertInfo.insertedCount === 0) throw `Could not add listing.`

    // return newListing;
  },

  async getListing(listingId) {
    common.checkObjectId(listingId);
    // listingId = listingId.trim();
    listingId = ObjectId(listingId);
    const parkingsCollection = await parkings();
    let parkingsList = await parkingsCollection.find({}).toArray();
    let flag = 1;
    for (let parking of parkingsList) {
      for (let listing of parking.listing) {
        if (listing._id.toString() == listingId) {
          flag = 0;
          listing = common.convertObjectIdToString(listing);
          return listing;
        }
      }
    }
    if (flag == 1) throw `Listing not found.`;

    // listingId = listingId.trim();
    // listingId = ObjectId(listingId);
    // const parkingsCollection = await parkings();
    // let listingIdObj = await parkingsCollection.findOne({
    //   _id: ObjectId(listingId),
    // });
    // if (listingIdObj === null) throw `No listings found.`;
    // listingIdObj._id = listingIdObj._id.toString();
    // return listingIdObj;
  },

  // Pending: get the listing according to filters
  async getAllListings(listerId) {
    common.checkObjectId(listerId);

    const parkingsCollection = await parkings();
    let parkingIdObj = await parkingsCollection.findOne({
      _id: ObjectId(listerId),
    });
    if (parkingIdObj === null) throw `No listing with that id.`;
    let listingArr = [];
    for (let i = 0; i < parkingIdObj.listing.length; i++) {
      listingArr.push(common.convertObjectIdToString(parkingIdObj.listing[i]));
    }

    return listingArr;
  },

  async removeListing(listingId) {
    const parkingsCollection = await parkings();
    let parkingsList = await parkingsCollection.find({}).toArray();
    let flag = 1;
    let listerId;
    for (let parking of parkingsList) {
      for (let listing of parking.listing) {
        if (listing._id.toString() == listingId) {
          flag = 0;
          listerId = parking._id.toString();
          const listingRemoved = await parkingsCollection.updateOne(
            { _id: ObjectId(parking._id) },
            { $pull: { listing: listing } }
          );
          if (!listingRemoved.acknowledged == true)
            throw `Could not remove listing for the parking.`;
          else {
            let removedListing = await parkingsData.getParking(listerId);
            removedListing = common.convertObjectIdToString(removedListing);
            let removedListingArr = [];
            for (let listingsData of removedListing.listing) {
              listingsData = common.convertObjectIdToString(listingsData);
              removedListingArr.push(listingsData);
            }
            removedListing.listing = removedListingArr;
            return removedListing;
          }
        }
      }
    }
    if (flag == 1) throw `Listing not found.`;
  },

  async updateListingByLister(
    listerId,
    listingId,
    startDate,
    endDate,
    startTime,
    endTime,
    // userCarCategory,
    price
  ) {
    // const parkingsCollection = await parkings();
    // let constParkingId = await parkingsCollection.findOne({
    //   _id: ObjectId(listerId),
    // });

    // if (constParkingId === null) throw `No parking with that id.`;

    // let flag = 1;
    // let listingData;
    // for(let parking of constParkingId.listing) {
    //   if(parking._id.toString() == listingId) {
    //     flag = 0;
    //     listingData = parking;
    //     break;
    //   }
    // }
    // if(flag == 1) throw `No listing found with this id.`

    const listingData = await getListing(listingId);

    if (startDate == "" || startDate == null) startDate = listingData.startDate;
    else common.checkInputDate(startDate);
    if (endDate == "" || endDate == null) endDate = listingData.endDate;
    else common.checkInputDate(endDate);
    if (startTime == "" || startTime == null) startTime = listingData.startTime;
    else common.checkInputTime(startTime);
    if (endTime == "" || endTime == null) endTime = listingData.endTime;
    else common.checkInputTime(endTime);
    if (price == "" || price == null) price = listingData.price;
    else common.checkIsProperNumber(price);

    const updateListing = {
      startDate: startDate,
      endDate: endDate,
      startTime: startTime,
      endTime: endTime,
      price: price,
      booked: listingData.booked,
      bookerId: listingData.bookerId,
      numberPlate: listingData.numberPlate,
    };

    // Reference: https://stackoverflow.com/questions/5646798/mongodb-updating-subdocument
    // https://stackoverflow.com/questions/60586215/multiple-conditions-in-updateone-query-in-mongodb
    const updatedListings = await parkingsCollection.updateOne(
      {
        _id: ObjectId(listerId),
        "listing._id": ObjectId(listingId),
      },
      { $set: updateListing },
      { upsert: true }
    );
    // Pending
    // Error: matched count = 1, modified count = 0
    // console.log(updatedListings.upsertedId);
    if (updatedListings.modifiedCount === 0)
      throw `Could not update listing successfully.`;

    // return updatedListings;
    return await getListing(listingId);
  },

  async updateListingByUser(listerId, listingId, bookerId, numberPlate, userCarCategory) {},

  // async listingDetail(bookerId, startDate, endDate, startTime, endTime, booked, numberPlate, price) {
  //   if (
  //     !bookerId ||
  //     !startDate ||
  //     !endDate ||
  //     !startTime ||
  //     !endTime ||
  //     !booked ||
  //     !numberPlate ||
  //     !price
  //   ) {
  //     throw `Missing parameter`;
  //   }

  //   common.checkIsProperString(bookerId);
  //   common.checkInputDate(startDate);
  //   common.checkInputDate(endDate);
  //   common.checkInputTime(startTime);
  //   common.checkInputTime(endTime);
  //   common.checkIsProperBoolean(booked);
  //   common.checkIsProperNumber(price);
  //   common.checkNumberPlate(numberPlate);

  //   const parkingsCollection = await parkings();
  //   let listingIdObj = await parkingsCollection.findOne({
  //     _id: ObjectId(id),
  //   });
  //   if (listingIdObj === null) throw `No listings found.`;
  //   listingIdObj._id = listingIdObj._id.toString();
  //   return listingIdObj;
  // }
};

module.exports = exportedMethods;
