const { parkings, users } = require("./../config/mongoCollections");
const { ObjectId } = require("mongodb");
const common = require("./common");
const parkingsData = require("./parkings");
const sessionStorage = require("sessionstorage");

const nodemailer = require("nodemailer");

let exportedMethods = {
  async createListing(userId, listerId, startDate, endDate, startTime, endTime, price) {
    if (
      common.xssCheck(listerId) ||
      common.xssCheck(startDate) ||
      common.xssCheck(endDate) ||
      common.xssCheck(startTime) ||
      common.xssCheck(endTime) ||
      common.xssCheck(price)
    ) {
      throw `XSS Attempt`;
    }

    let booked = false;
    let bookerId = null;
    let numberPlate = null;
    if (
      !userId ||
      !listerId ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      !price
    ) {
      throw `Missing parameter`;
    }

    common.checkIsProperString(listerId);
    common.checkIsProperString(userId);
    common.checkInputTime(startTime);
    common.checkInputTime(endTime);
    common.checkIsProperNumber(price);

    // Pending: if end time is less than start time then increment the date by 1
    var today = new Date();
    common.checkInputDate(today, startDate, 1);
    common.checkInputDate(startDate, endDate, 0);

    let timeSlots = [];
    timeSlots = common.timeSlotFunc(startTime, endTime, startDate, endDate);

    const parkingsCollection = await parkings();
    const usersCollection = await users();

    let constParkingId = await parkingsCollection.findOne({
      _id: ObjectId(listerId),
    });

    if (constParkingId === null) throw `No parking with that id.`;

    let constUserId = await usersCollection.findOne({
      _id: ObjectId(userId),
    });

    if (constUserId === null) throw `No user with that id.`;

    let createdListing;

    // let numberOfDays = Math.round(Math.abs((new Date(endDate) - new Date(startDate)) / 24));
    // let hourDiff = parseInt(endTime) - parseInt(startTime);
    // let startDateTemp = startDate;
    // let endDateTemp = startDate;
    for (let i = 0; i < timeSlots.length; i++) {
      
      // if(timeSlots[i].startsWith("00:00") || timeSlots[i].startsWith("0:00")) {
      //   startDateTemp.setDate(startDateTemp.getDate() + 1);
      //   endDateTemp.setDate(endDateTemp.getDate() + 1);
      // }
      
      let newListing = {
        _id: ObjectId(),
        // startDate: startDateTemp,
        // endDate: endDateTemp,
        startDate: startDate,
        endDate: endDate,
        startTime: startTime,
        endTime: endTime,
        timeSlots: timeSlots[i],
        price: price,
        booked: booked,
        bookerId: bookerId,
        numberPlate: numberPlate
      };

      const addListing = {
        listing: newListing,
      };

      const listingAdded = await parkingsCollection.updateOne(
        { _id: ObjectId(listerId) },
        { $addToSet: addListing }
      );

      if (listingAdded.modifiedCount === 0)
        throw `Could not add listing for the parking.`;
      else {
        let listingArr = [];
        let listingId;
        createdListing = await parkingsData.getParking(listerId);
        createdListing = common.convertObjectIdToString(createdListing);
        let createdListingArr = [];
        for (let listingsData of createdListing.listing) {
          listingsData = common.convertObjectIdToString(listingsData);
          createdListingArr.push(listingsData);
          listingArr.push(ObjectId(listingsData._id));
        }
        listingId =
          createdListing.listing[createdListing.listing.length - 1]._id;

        const listingArrUpdated = await usersCollection.updateOne(
          { _id: ObjectId(userId) },
          { $set: { listings: listingArr } }
        );
        if (listingArrUpdated.modifiedCount === 0) {
          const removeListingData = await this.removeListing(userId, listingId);
          throw `Could not add listing to the user db.`;
        }

        createdListing.listing = createdListingArr;
      }
    }
    return createdListing;
  },

  async getListing(listingId) {
    common.checkObjectId(listingId);
    // listingId = ObjectId(listingId);
    // listingId = listingId.trim();

    if (common.xssCheck(listerId)) {
      throw `XSS Attempt`;
    }

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
  },

  async getAllListings(listerId) {
    common.checkObjectId(listerId);

    const parkingsCollection = await parkings();
    let parkingIdObj = await parkingsCollection.findOne({
      _id: ObjectId(listerId),
    });
    if (parkingIdObj === null) throw `No listing with that id.`;
    let listingArr = [];
    for (let i = 0; i < parkingIdObj.listing.length; i++) {
      if (parkingIdObj.listing[i].booked != true)
        listingArr.push(
          common.convertObjectIdToString(parkingIdObj.listing[i])
        );
    }
    parkingIdObj.listing = listingArr;
    return parkingIdObj;
  },

  async removeListing(userId, listingId) {
    common.checkObjectId(userId);
    common.checkObjectId(listingId);

    const getListingData = await this.getListing(listingId);
    if(getListingData.booked == true) throw `Cannot delete booked listing.`;
      
    const parkingsCollection = await parkings();
    const usersCollection = await users();
    let constUserId = await usersCollection.findOne({
      _id: ObjectId(userId),
    });

    if (constUserId === null) throw `No user with that id.`;

    // const constUserId = await this.getMyBookings(userId);
    let flagCheck = 0;
    for (let i = 0; i < constUserId.listings.length; i++) {
      if (constUserId.listings[i].toString() == listingId) flagCheck = 1;
    }
    if (flagCheck == 0) throw `Not authorized to delete.`;

    let backupListing;
    let parkingsList = await parkingsCollection.find({}).toArray();
    let flag = 1;
    let listerId;
    for (let parking of parkingsList) {
      for (let listing of parking.listing) {
        if (listing._id.toString() == listingId) {
          // removeListingId = listing._id;
          backupListing = listing;

          flag = 0;
          listerId = parking._id.toString();
          const listingRemoved = await parkingsCollection.updateOne(
            { _id: ObjectId(parking._id) },
            { $pull: { listing: listing } }
          );
          if (listingRemoved.modifiedCount === 0)
            throw `Could not remove listing for the parking.`;
          else {
            let removedListing = await parkingsData.getParking(listerId);
            removedListing = common.convertObjectIdToString(removedListing);
            let removedListingArr = [];
            let removedListingArrObjId = [];
            for (let listingsData of removedListing.listing) {
              listingsData = common.convertObjectIdToString(listingsData);
              removedListingArr.push(listingsData);
              removedListingArrObjId.push(ObjectId(listingsData._id));
            }

            const listingArrUpdated = await usersCollection.updateOne(
              { _id: ObjectId(userId) },
              { $set: { listings: removedListingArrObjId } }
              // {$push: listingId}
            );
            if (listingArrUpdated.modifiedCount === 0) {
              storeListingInCaseOfError(userId, backupListing);
              throw `Could not remove listing to the user db.`;
            }

            removedListing.listing = removedListingArr;
            return removedListing;
          }
        }
      }
    }
    if (flag == 1) throw `Listing not found.`;
  },

  async getMyBookings(userId) {
    common.checkObjectId(userId);
    const usersCollection = await users();
    let constUserId = await usersCollection.findOne({
      _id: ObjectId(userId),
    });
    if (constUserId === null) throw `No user with that id.`;

    let listingData;
    let listingArr = [];
    for (let i = 0; i < constUserId.bookings.length; i++) {
      listingData = await this.getListing(constUserId.bookings[i].toString());
      listingArr.push(listingData);
    }
    return listingArr;
  },

  async getMyListings(userId) {
    common.checkObjectId(userId);
    const usersCollection = await users();
    let constUserId = await usersCollection.findOne({
      _id: ObjectId(userId),
    });
    if (constUserId === null) throw `No user with that id.`;

    let listingData;
    let listingArr = [];
    for (let i = 0; i < constUserId.listings.length; i++) {
      listingData = await this.getListing(constUserId.listings[i].toString());
      listingArr.push(listingData);
    }
    return listingArr;
  },

  async getParkingId(listingId) {
    common.checkObjectId(listingId);
    // listingId = ObjectId(listingId);
    const parkingsCollection = await parkings();
    let parkingsList = await parkingsCollection.find({}).toArray();
    let flag = 1;
    for (let parking of parkingsList) {
      for (let listing of parking.listing) {
        if (listing._id.toString() == listingId) {
          flag = 0;
          listing = common.convertObjectIdToString(listing);
          return parking._id.toString();
        }
      }
    }
    if (flag == 1) throw `Listing not found.`;
  },

  async cancelBooking(
    // parkingId,
    userId,
    listingId
  ) {

    const parkingsCollection = await parkings();
    const usersCollection = await users();

    let userData = await usersCollection.findOne({
      _id: ObjectId(userId),
    });

    if (userData === null) throw `No user with that id.`;

    // const userData = await this.getMyBookings(userId);
    let flagCheck = 0;
    for (let i = 0; i < userData.bookings.length; i++) {
      if (userData.bookings[i].toString == listingId) flagCheck = 1;
    }
    if (flagCheck == 0) throw `Not authorized to cancel booking.`;

    common.checkObjectId(userId);
    common.checkObjectId(listingId);
    const listingData = await this.getListing(listingId);
    let cancelListingId = listingData._id;

    let constUserId = await usersCollection.findOne({
      _id: ObjectId(userId),
    });

    if (constUserId === null) throw `No user with that id.`;

    let userBookingsList = [];
    let updatedBookingList = [];
    userBookingsList = constUserId.bookings;
    for (let i = 0; i < userBookingsList.length; i++) {
      if (userBookingsList[i].toString() != listingData._id) {
        updatedBookingList.push(ObjectId(userBookingsList[i]));
      }
    }

    let parkingId = await this.getParkingId(listingId);

    const removeCancelListing = {
      _id: ObjectId(listingData._id),
      startDate: listingData.startDate,
      endDate: listingData.endDate,
      startTime: listingData.startTime,
      endTime: listingData.endTime,
      timeSlots: listingData.timeSlots,
      price: listingData.price,
      booked: listingData.booked,
      bookerId: listingData.bookerId,
      numberPlate: listingData.numberPlate,
    };

    const updateCancelListing = {
      _id: ObjectId(listingData._id),
      startDate: listingData.startDate,
      endDate: listingData.endDate,
      startTime: listingData.startTime,
      endTime: listingData.endTime,
      timeSlots: listingData.timeSlots,
      price: listingData.price,
      booked: false,
      bookerId: "",
      numberPlate: "",
    };

    const removeListings = await parkingsCollection.updateOne(
      {
        _id: ObjectId(parkingId),
        "listing._id": ObjectId(listingId),
      },
      { $pull: { listing: removeCancelListing } }
    );
    if (removeListings.modifiedCount !== 0) {
      const updatedListings = await parkingsCollection.updateOne(
        {
          _id: ObjectId(parkingId),
        },
        { $addToSet: { listing: updateCancelListing } }
      );
      if (updatedListings.modifiedCount === 0)
        throw `Could not cancel booking.`;

      const updateUserBookingList = await usersCollection.updateOne(
        { _id: ObjectId(userId) },
        { $set: { bookings: updatedBookingList } }
      );

      if (updateUserBookingList.modifiedCount === 0)
        throw `Could not cancel booking.`;

      return await this.getMyBookings(userId);
    } else {
      throw `Could not cancel booking.`;
    }
  },

  async updateListingByLister(
    userId,
    listerId,
    listingId,
    startDate,
    endDate,
    startTime,
    endTime,
    price
  ) {
    common.checkObjectId(userId);
    common.checkObjectId(listerId);
    common.checkObjectId(listingId);


    const parkingData = await parkingsData.getParking(listerId);
    if (userId !== parkingData.listerId.toString())
      throw `Not authorized to update.`;

    const getListingData = await this.getListing(listingId);
    if(getListingData.booked == true) throw `Cannot update booked listing.`;
    const listingData = await this.getListing(listingId);

    if (
      common.xssCheck(listerId) ||
      common.xssCheck(startDate) ||
      common.xssCheck(endDate) ||
      common.xssCheck(startTime) ||
      common.xssCheck(endTime) ||
      common.xssCheck(price)
    ) {
      throw `XSS Attempt`;
    }

    //Pending: validation for start date with ed date after updating
    if (startDate == "" || startDate == null) startDate = listingData.startDate;
    else {
      var today = new Date();
      common.checkInputDate(today, startDate, 1);
    }
    if (endDate == "" || endDate == null) {
      endDate = listingData.endDate;
      common.checkInputDate(startDate, endDate, 0);
    } else common.checkInputDate(startDate, endDate, 0);

    if ((new Date(startDate)).getTime() != (new Date(endDate)).getTime())
      throw `Only same day updates allowed.`;

    if (startTime == 'Select Start Time' || startTime == "" || startTime == null) startTime = listingData.startTime;
    else common.checkInputTime(startTime);
    if (endTime == 'Select End Time' || endTime == "" || endTime == null) endTime = listingData.endTime;
    else common.checkInputTime(endTime);
    if (price == "" || price == null) price = listingData.price;
    else common.checkIsProperNumber(price);


    let timeSlots;
    let numberOfDays = Math.round(Math.abs((new Date(endDate) - new Date(startDate)) / 24));
    // if(numberOfDays !== 0)
    //   throw `Changes only for one day.`;
    if((parseInt(startTime)==24 && parseInt(endTime)==0) || 
      (Math.abs(parseInt(endTime) - parseInt(startTime)) != 1))
      throw `Only hourly updates allowed.`;
    else
      timeSlots = startTime + ":00 - " + endTime + ":00";

    const updateListing = {
      _id: ObjectId(listingData._id), //listingData[i]._id
      startDate: startDate,
      endDate: endDate,
      startTime: startTime,
      endTime: endTime,
      timeSlots: timeSlots,
      price: price,
      booked: listingData.booked,
      bookerId: listingData.bookerId,
      numberPlate: listingData.numberPlate,
    };

    const removeListing = {
      _id: ObjectId(listingData._id),
      startDate: listingData.startDate,
      endDate: listingData.endDate,
      startTime: listingData.startTime,
      endTime: listingData.endTime,
      timeSlots: listingData.timeSlots,
      price: listingData.price,
      booked: listingData.booked,
      bookerId: listingData.bookerId,
      numberPlate: listingData.numberPlate,
    };

    const parkingsCollection = await parkings();

    const removeListings = await parkingsCollection.updateOne(
      {
        _id: ObjectId(listerId),
        "listing._id": ObjectId(listingId),
      },
      { $pull: { listing: removeListing } }
    );
    if (removeListings.modifiedCount !== 0) {
      // check correct param for remove listing
      const updatedListings = await parkingsCollection.updateOne(
        {
          _id: ObjectId(listerId),
        },
        { $addToSet: { listing: updateListing } }
      );
      if (updatedListings.modifiedCount === 0)
        throw `Could not update listing successfully.`;

      return await parkingsData.getParking(listerId);;
    } else {
      throw `Could not update listing successfully.`;
    }
  },

  async bookListing(userId, listerId, listingId, bookerId, numberPlate) {

    common.checkObjectId(userId);
    common.checkObjectId(listerId);
    common.checkObjectId(listingId);
    common.checkObjectId(bookerId);
    common.checkNumberPlate(numberPlate);

    const parkingData = await parkingsData.getParking(listerId);
    if (userId === parkingData.listerId.toString())
      throw `Cannot book your own parking.`;
    if (
      common.xssCheck(listerId) ||
      common.xssCheck(listingId) ||
      common.xssCheck(bookerId) ||
      common.xssCheck(numberPlate)
    ) {
      throw `XSS Attempt`;
    }

    let getListingData = await this.getListing(listingId);
    const updateListing = {
      _id: ObjectId(getListingData._id),
      startDate: getListingData.startDate,
      endDate: getListingData.endDate,
      startTime: getListingData.startTime,
      endTime: getListingData.endTime,
      timeSlots: getListingData.timeSlots,
      price: getListingData.price, 
      booked: true,
      bookerId: ObjectId(bookerId),
      numberPlate: numberPlate,
    };

    const removeListing = {
      _id: ObjectId(getListingData._id),
      startDate: getListingData.startDate,
      endDate: getListingData.endDate,
      startTime: getListingData.startTime,
      endTime: getListingData.endTime,
      timeSlots: getListingData.timeSlots,
      price: getListingData.price, // pending: update price acc to number of hours inputed
      booked: getListingData.booked,
      bookerId: getListingData.bookerId,
      numberPlate: getListingData.numberPlate,
    };

    const parkingsCollection = await parkings();
    const usersCollection = await users();
    let constUserId = await usersCollection.findOne({
      _id: ObjectId(userId),
    });
    if (constUserId === null) throw `No user with that id.`;

    let userBookingsList = [];
    userBookingsList = constUserId.bookings;

    const removeListings = await parkingsCollection.updateOne(
      {
        _id: ObjectId(listerId),
        "listing._id": ObjectId(listingId),
      },
      { $pull: { listing: removeListing } }
    );
    if (removeListings.modifiedCount !== 0) {
      // check correct param for remove listing
      const updatedListings = await parkingsCollection.updateOne(
        {
          _id: ObjectId(listerId),
        },
        { $addToSet: { listing: updateListing } }
      );
      if (updatedListings.modifiedCount === 0)
        throw `Could not book listing successfully.`;

      userBookingsList.push(ObjectId(getListingData._id));
      const listingArrUpdated = await usersCollection.updateOne(
        { _id: ObjectId(userId) },
        { $set: { bookings: userBookingsList } }
      );
      if (listingArrUpdated.modifiedCount === 0) {
        throw `Could not add booking to the user db.`;
      }
      return await this.getAllListings(listerId);
    } else {
      throw `Could not book listing successfully.`;
    }
  },

  async storeListingInCaseOfError(userId, listing) {
    const addListingBack = await this.createListing(
      userId,
      sessionStorage.getItem("parkingId"),
      listing.startDate,
      listing.endDate,
      listing.startTime,
      listing.endTime,
      listing.price
    );
  },
  
  //mailing module
  //reused from https://www.geeksforgeeks.org/how-to-send-email-with-nodemailer-using-gmail-account-in-node-js/
  async sendReportingMail(to, why, whom) {
    let mailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "noreply.myparkingassistant@gmail.com",
        pass: "Myparking@1234#",
      },
    });

    let mailDetails = {
      from: "noreply.myparkingassistant@gmail.com",
      to: "cakemeberry@gmail.com",
      subject: "You have been reported",
      text: "You have been reported for: comment, by reported",
      // html: "<b>Hello world?</b>", // html body
    };

    mailTransporter.sendMail(mailDetails, function (err, data) {
      if (err) {
        console.log("Error Occurs");
      } else {
        console.log("Email sent successfully");
      }
    });
  }
}

module.exports = exportedMethods;
