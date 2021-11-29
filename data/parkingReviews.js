const mongoCollections = require('../config/mongoCollections');
const parkings = mongoCollections.parkings;
// const parkingReviews = mongoCollections.parkingReviews
const { ObjectId } = require('mongodb');

function checkId(id) {
    if (!id)
        throw 'You must provide valid input for your review';

    if (typeof id !== 'string')
        throw 'Please enter a valid string for your review input';

    if(!id.trim().replace(/\s/g, "").length)
        throw 'Only empty spaces in the review input strings are not allowed';

    if(!ObjectId.isValid(id))
        throw 'The ID is not a valid Object ID';
}

let exportedMethods = {
    async createReview(parkingId, userId, rating, dateOfReview, comment) {
        if (!parkingId || !userId || !rating || !dateOfReview || !comment)
            throw 'You must provide all valid inputs for your review';

        if (typeof parkingId !== 'string' || typeof userId !== 'string' || typeof dateOfReview !== 'string' || typeof comment !== 'string')
            throw 'Please enter a valid string for your review inputs';

        if(!parkingId.trim().replace(/\s/g, "").length || !userId.trim().replace(/\s/g, "").length ||  !dateOfReview.trim().replace(/\s/g, "").length || !comment.trim().replace(/\s/g, "").length)
            throw 'Only empty spaces in the review input strings are not allowed';

        if(!ObjectId.isValid(parkingId))
            throw 'The ID is not a valid Object ID';

        if(typeof rating !== 'number' || rating < 0 || rating > 5)
            throw 'Please enter a valid rating';

        let pattern = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
        let arrayOfObject = [];
        let avgRating = 0;

        if(!pattern.test(dateOfReview.trim()))
            throw 'The date provided is not a valid date. Please enter a valid date';

        let compareDate = dateOfReview.replace(/\//g, "");

        if(parseInt(compareDate.substring(0,4)) === 229 || parseInt(compareDate.substring(0,4)) === 230 || parseInt(compareDate.substring(0,4)) === 231)
            throw 'The month of February only contains 28 days. Please enter correct date';
    
        if(parseInt(compareDate.substring(0,4)) === 431 || parseInt(compareDate.substring(0,4)) === 631 || parseInt(compareDate.substring(0,4)) === 931 || parseInt(compareDate.substring(0,4)) === 1131)
            throw 'The month mentioned only contains 30 days. Please enter correct date';
    
        compareDate = compareDate.substring(0,8);
        compareDate = parseInt(compareDate);
    
        let currentDate = new Date(); 
        let dateTime =  + (currentDate.getMonth()+1)  + "/"
                        + currentDate.getDate() + "/" 
                        + currentDate.getFullYear();
    
        dateTime = dateTime.replace(/\//g, ""); 
        dateTime = dateTime.substring(0,8);
        dateTime = parseInt(dateTime);
    
        if(compareDate < dateTime)
            throw 'The date provided is not of the current day but it is of previous days';
        else if(compareDate > dateTime)
            throw 'The date provided is not of the current day but it is of next days';

        const parkingCollection = await parkings();
        const checkParking = await parkingCollection.findOne({ _id: ObjectId(parkingId)});
        
        if(checkParking === null)
            throw 'Parking does not exist';

        const newReview = {
            _id: new ObjectId(),
            parkingId: parkingId,
            userId: userId,
            rating: rating,
            dateOfReview: dateOfReview,
            comment: comment
        }

        const updateReview = await parkingCollection.updateOne(
            {_id: ObjectId(parkingId)},
            {$push: {parkingReviews: newReview}}
        )

        if(!updateReview.matchedCount && !updateReview.modifiedCount)
            throw 'Creating reviews have been failed'

        const sameReview = await parkingCollection.findOne({ _id: ObjectId(parkingId)});

        if(sameReview === null)
            throw 'Parking does not exist, review cannot be displayed';

        arrayOfObject.push(sameReview);
        console.log(arrayOfObject);

        arrayOfObject.forEach(element => {
            element.parkingReviews.forEach(data => {
                avgRating += data.rating;
            });
        });

        avgRating = (avgRating/sameReview.parkingReviews.length);

        const reviewUpdate = await parkingCollection.updateOne(
            {_id: ObjectId(parkingId)},
            {$set: {overallRating: avgRating}}
        )

        if(!reviewUpdate.matchedCount && !reviewUpdate.modifiedCount)
            throw 'Updating overallRating cannot be done';
        
        const parkingSpace = await parkingCollection.findOne({ _id: ObjectId(parkingId)});

        if(parkingSpace === null)
            throw 'No parking found with that ID';

        parkingSpace._id = parkingSpace._id.toString();

        for(let key in parkingSpace) {
            if(typeof parkingSpace[key] === 'object' && key === "parkingReviews") {
                if(Array.isArray(parkingSpace[key])) {
                    for(let i = 0; i < parkingSpace[key].length; i++) {
                        parkingSpace[key][i]._id = parkingSpace[key][i]._id.toString();
                    }
                }
            }
        }
        return parkingSpace;
    },

    async getReview(reviewId) {
        checkId(reviewId);

        let resultData = {};
        const parkingCollection = await parkings()
        const parking = await parkingCollection.find({}).toArray();

        if(parking === null)
            throw 'No review present with that ID';

        parking.forEach(element => {
            element.parkingReviews.forEach(data => {
                if(data._id.toString() === reviewId.toString()) {
                    resultData = {"_id": data._id, "parkingId": data.parkingId, "userId": data.userId, "rating": data.rating, "dateOfReview": data.dateOfReview, "comment": data.comment};
                }
            })
        });
        resultData._id = resultData._id.toString();
        return resultData;
    },

    async getAllReviewsOfParking(parkingId) {
        checkId(parkingId);

        const parkingCollection = await parkings();
        const parking = await parkingCollection.findOne({_id: ObjectId(parkingId)})

        if(parking === null)
            throw 'No parking found with that ID';

        parking.parkingReviews.forEach(element => {
            element._id = element._id.toString();
        })
        return parking.parkingReviews;
    },

    async getAllReviewsOfUser(listerId) {
        checkId(listerId);

        let resultData = {};
        const parkingCollection = await parkings()
        const parking = await parkingCollection.find({}).toArray();

        if(parking === null)
            throw 'No review present with that ID';

        parking.forEach(element => {
            element.parkingReviews.forEach(data => {
                if(data.userId.toString() === listerId.toString()) {
                    resultData = {"_id": data._id, "parkingId": data.parkingId, "userId": data.userId, "rating": data.rating, "dateOfReview": data.dateOfReview, "comment": data.comment};
                }
            })
        });
        resultData._id = resultData._id.toString();
        return resultData;
    },

    async removeReview(reviewId) {
        checkId(reviewId);

        let avgRating = 0;
        let resultData = {};        
        console.log("Inside the remove review by ID function");
        const parkingCollection = await parkings();
        const parking = await parkingCollection.aggregate([{$unwind: "$parkingReviews"}, {$match: {"parkingReviews._id": ObjectId(reviewId)}}, {"$replaceRoot": {"newRoot": "$parkingReviews"}}]).toArray();
    
        if(parking === null)
            throw 'No review present with that Id';

        const removeReview = await parkingCollection.updateOne({}, {$pull: {parkingReviews: {_id: ObjectId(reviewId)}}});
    
        if(!removeReview.matchedCount && !removeReview.modifiedCount)
            throw 'Removal of review has failed';
        
        const parkReview = await parkingCollection.find({}).toArray();
    
        if(parkReview === null)
            throw 'No review present with that Id';

        parkReview.forEach(element => {
            if(element._id.toString() === parking[0].parkingId.toString()) {
                element.parkingReviews.forEach(data => {
                    avgRating += data.rating;
                })
                avgRating = (avgRating/element.parkingReviews.length);
            }
        });
    
        const reviewUpdate = await parkingCollection.updateOne(
            {_id: ObjectId(parking[0].parkingId)},
            {$set: {overallRating: avgRating}}
        )
    
        if(!reviewUpdate.matchedCount && !reviewUpdate.modifiedCount)
            throw 'Update of the rating has been failed';

        resultData = {"reviewId": reviewId, "deleted": true};
        return resultData;
    },

    async updateReview(reviewId, rating, comment) {
        checkId(reviewId);

        if (!rating || !comment)
            throw 'You must provide valid reviewId input for your review';
        
        if (typeof comment !== 'string')
            throw 'Please enter a valid string for your reviewId inputs';

        if(!comment.trim().replace(/\s/g, "").length)
            throw 'Only empty spaces in the reviewId input is not allowed';

        if(typeof rating !== 'number' || rating < 0 || rating > 5)
            throw 'Please enter a valid rating';

        avgRating = 0;
        const parkingCollection = await parkings();
        
        const findReview = await parkingCollection.aggregate([{$unwind: "$parkingReviews"}, {$match: {"parkingReviews._id": ObjectId(reviewId)}}, {"$replaceRoot": {"newRoot": "$parkingReviews"}}]).toArray();

        if(findReview === null)
            throw 'Review does not exist';
 
        const extractReview = await parkingCollection.updateOne({}, {$pull: {parkingReviews: {_id: ObjectId(reviewId)}}});

        if(!extractReview.matchedCount && !extractReview.modifiedCount)
            throw 'Review update has been failed';

        const newReviewInfo = {
            _id: findReview[0]._id,
            parkingId: findReview[0].parkingId,
            userId: findReview[0].userId,
            rating: rating,
            comment: comment
        }

        const updateReview = await parkingCollection.updateOne(
            {_id: ObjectId(findReview[0].parkingId)},
            {$push: {parkingReviews: newReviewInfo}}
        );

        if(!updateReview.matchedCount && !updateReview.modifiedCount)
            throw 'Update has been failed';

        if(!updateReview.modifiedCount)
            throw 'Same values has been provided for update. Please change the values';

        const parkReview = await parkingCollection.find({}).toArray();
    
        if(parkReview === null)
            throw 'No review present with that Id';

        parkReview.forEach(element => {
            if(element._id.toString() === findReview[0].parkingId.toString()) { 
                element.parkingReviews.forEach(data => {
                    avgRating += data.rating;
                })
                avgRating = (avgRating/element.parkingReviews.length);
            }
        });
    
        const ratingUpdate = await parkingCollection.updateOne(
            {_id: ObjectId(findReview[0].parkingId)},
            {$set: {overallRating: avgRating}}
        )
    
        if(!ratingUpdate.matchedCount && !ratingUpdate.modifiedCount)
            throw 'Update of the rating has been failed';

        return await this.getReview(reviewId);
    }
}

module.exports = exportedMethods;