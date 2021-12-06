const mongoCollections = require('../config/mongoCollections');
const parkings = mongoCollections.parkings;
const errorCheck = require('./errorHandling');
const { ObjectId } = require('mongodb');

const updateRating = (checkParking, rating) => {
    rating = parseInt(rating);
    let avgRating = rating;
    checkParking.parkingReviews.forEach((element) => {
        avgRating += element.rating;
    })
    
    avgRating = Number(avgRating/(checkParking.parkingReviews.length + 1)).toFixed(2);
    return avgRating;
}

let exportedMethods = {
    async createReview(parkingId, userId, rating, dateOfReview, comment) {
        if(!errorCheck.checkId(parkingId)) throw 'parkingId is not a valid input';
        if(!errorCheck.checkId(userId)) throw 'userId is not a valid input';
        if(!errorCheck.checkRating(rating)) throw 'Rating is not a valid input';
        if(!errorCheck.checkString(comment)) throw 'Comment is not a valid input';

        if(!errorCheck.checkDate(dateOfReview)) throw 'The date provided is not a valid date. Please enter a valid date of today';

        const parkingCollection = await parkings();
        const checkParking = await parkingCollection.findOne({ _id: ObjectId(parkingId)});
        
        if(checkParking === null)
            throw 'Parking does not exist';

        const averageRating = updateRating(checkParking, rating, 'C');

        const newReview = {
            _id: new ObjectId(),
            parkingId: parkingId,
            userId: userId,
            rating: rating,
            dateOfReview: dateOfReview,
            comment: comment
        }

        const ratingUpdate = await parkingCollection.updateOne(
            {_id: ObjectId(parkingId)},
            {$set: {overallRating: averageRating}, $push: {parkingReviews: newReview}}
        )

        if(!ratingUpdate.matchedCount && !ratingUpdate.modifiedCount)
            throw 'Creating reviews have been failed'
        
        const sameReview = await parkingCollection.findOne({ _id: ObjectId(parkingId)});

        if(sameReview === null)
            throw 'Parking does not exist, review cannot be displayed';
        
        return sameReview;
    },

    async getReview(reviewId) {
        if(!errorCheck.checkId(reviewId)) throw 'Review Id is not a valid input';

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
        return resultData;
    },

    async getAllReviewsOfParking(parkingId) {
        if(!errorCheck.checkId(parkingId)) throw 'Parking Id is not a valid input';

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
        if(!errorCheck.checkId(listerId)) throw 'Lister Id is not a valid input';

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
        if(!errorCheck.checkId(reviewId)) throw 'Review Id is not a valid input';

        let avgRating = 0;
        let resultData = {};        
        const parkingCollection = await parkings();
        const parking = await parkingCollection.aggregate([{$unwind: "$parkingReviews"}, {$match: {"parkingReviews._id": ObjectId(reviewId)}}, {"$replaceRoot": {"newRoot": "$parkingReviews"}}]).toArray();
    
        if(parking === null)
            throw 'No review present with that Id';

        const removeReview = await parkingCollection.updateOne({}, {$pull: {parkingReviews: {_id: ObjectId(reviewId)}}});
    
        if(!removeReview.matchedCount && !removeReview.modifiedCount)
            throw 'Removal of review has failed';
        
        const getParkingData = await parkingCollection.findOne({_id: ObjectId(parking[0].parkingId)});

        if(getParkingData === null)
                throw 'No parking found with that ID';
            
        getParkingData.parkingReviews.forEach((element) => {
            avgRating += element.rating;
        })
    
        if(getParkingData.parkingReviews.length !== 0) {
            avgRating = Number(avgRating/(getParkingData.parkingReviews.length)).toFixed(2);
        }
        else {
            avgRating = 0;
        }
    
        const reviewUpdate = await parkingCollection.updateOne(
            {_id: ObjectId(parking[0].parkingId)},
            {$set: {overallRating: avgRating}}
        )
    
        if(!reviewUpdate.matchedCount && !reviewUpdate.modifiedCount)
            throw 'Update of the rating has been failed';

        resultData = {"reviewId": reviewId, "deleted": true, parkingId: parking[0].parkingId};
        return resultData;
    },

    async updateReview(reviewId, rating, comment) {
        if(!errorCheck.checkId(reviewId)) throw 'Review Id is not a valid input';
        if(!errorCheck.checkRating(rating)) throw 'Rating is not a valid input';
        if(!errorCheck.checkString(comment)) throw 'Comment is not a valid input';

        rating = parseInt(rating);
        const parkingCollection = await parkings();
        const findReview = await parkingCollection.aggregate([{$unwind: "$parkingReviews"}, {$match: {"parkingReviews._id": ObjectId(reviewId)}}, {"$replaceRoot": {"newRoot": "$parkingReviews"}}]).toArray();

        if(findReview === null)
            throw 'Review does not exist';
 
        const extractReview = await parkingCollection.updateOne({}, {$pull: {parkingReviews: {_id: ObjectId(reviewId)}}});

        if(!extractReview.matchedCount && !extractReview.modifiedCount)
            throw 'Review update has been failed';

        const getParkingData = await parkingCollection.findOne({_id: ObjectId(findReview[0].parkingId)});    

        if(getParkingData === null)
            throw 'No parking found with that ID';
        
        let avgRating = rating;
        getParkingData.parkingReviews.forEach((element) => {
                avgRating += element.rating;
        })

        if(getParkingData.parkingReviews.length !== 0) {
            avgRating = Number(avgRating/(getParkingData.parkingReviews.length + 1)).toFixed(2);
        }
        else {
            avgRating = rating;
        }

        const newReviewInfo = {
            _id: findReview[0]._id,
            parkingId: findReview[0].parkingId,
            userId: findReview[0].userId,
            rating: rating,
            dateOfReview: findReview[0].dateOfReview,
            comment: comment
        }

        const updateReview = await parkingCollection.updateOne(
            {_id: ObjectId(findReview[0].parkingId)},
            {$set: {overallRating: avgRating}, $push: {parkingReviews: newReviewInfo}}
        );

        if(!updateReview.matchedCount && !updateReview.modifiedCount)
            throw 'Update has been failed';

        if(!updateReview.modifiedCount)
            throw 'Same values has been provided for update. Please change the values';

        return await this.getReview(reviewId);
    }
}

module.exports = exportedMethods;