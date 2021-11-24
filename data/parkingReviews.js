const mongoCollections = require('../config/mongoCollections');
const parkings = mongoCollections.parkings;
// const parkingReviews = mongoCollections.parkingReviews
const { ObjectId } = require('mongodb');

let exportedMethods = {
    async createReview(parkingId, userId, rating, dateOfReview, comment) {
        let arrayOfObject = [];
        let avgRating = 0;
        const parkingCollection = await parkings();
        const checkParking = await parkingCollection.findOne({ _id: ObjectId(parkingId)});
        
        console.log(ObjectId(parkingId));
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

    async getAllReviews(parkingId) {
        const parkingCollection = new parkings()
        const parking = await parkingCollection.findOne({_id: ObjectId(parkingId)})

        if(parking === null)
            throw 'No parking found with that ID';

        parking.parkingReviews.forEach(element => {
            element._id = element._id.toString();
        })
        return parking.parkingReviews;
    },

    async getReview(reviewId) {
        let resultData = {};
        const parkingCollection = await parkings()
        const parking = await parkingCollection.find({}).toArray();

        if(parking === null)
            throw 'No review present with that ID';

        parking.forEach(element => {
            element.parkingReviews.forEach(data => {
                if(data._id.toString() === reviewId) {
                    resultData = {"_id": data._id, "parkingId": data.parkingId, "userId": data.userId, "rating": data.rating, "dateOfReview": data.dateOfReview, "comment": data.comment};
                }
            })
        });
    
        resultData._id = resultData._id.toString();
        return resultData;
    },

    async removeReview(reviewId) {
        let parkingId = "";
        let avgRating = 0;
        let resultData = {};        
        console.log("Inside the remove review by ID function");
        const parkingCollection = await parkings();
        const parking = await parkingCollection.find({}).toArray();
    
        if(parking === null)
            throw 'No review present with that Id';

        parking.forEach(element => {
            element.parkingReviews.forEach(data => {
                if(data._id.toString() === reviewId) {
                    parkingId = element._id;
                }
            })
        });

        const removeReview = await parkingCollection.updateOne({}, {$pull: {parkingReviews: {_id: ObjectId(reviewId)}}});
    
        if(!removeReview.matchedCount && !removeReview.modifiedCount)
            throw 'Removal of review has failed';
        
        const parkReview = await parkingCollection.find({}).toArray();
    
        if(parkReview === null)
            throw 'No review present with that Id';

        parkReview.forEach(element => {
            if(element._id.toString() === parkingId.toString()) {
                element.parkingReviews.forEach(data => {
                    avgRating += data.rating;
                })
                avgRating = (avgRating/element.parkingReviews.length);
            }
        });
    
        const reviewUpdate = await parkingCollection.updateOne(
            {_id: ObjectId(parkingId)},
            {$set: {overallRating: avgRating}}
        )
    
        if(!reviewUpdate.matchedCount && !reviewUpdate.modifiedCount)
            throw 'Update of the rating has been failed';

        resultData = {"reviewId": reviewId, "deleted": true};
        console.log(resultData);    
        return resultData;
    },

    async updateReview(reviewId, rating, comment) {
        const parkingCollection = await parkings();
        const findReview = await parkingCollection.findOne({_id: ObjectId(reviewId)})

        if(findReview === null)
            throw 'Review does not exist';

        let reviewUpdateInfo = {
            rating: rating,
            comment: comment
        };

        const updateReview = await parkingCollection.updateOne(
            {_id: ObjectId(reviewId)},
            {$set: {parkingReviews: reviewUpdateInfo}}
        );

        if(!updateReview.matchedCount && !updateReview.modifiedCount)
            throw 'Update has been failed';

        if(!updateReview.modifiedCount)
            throw 'Same values has been provided for update. Please change the values';

        const parkReview = await parkingCollection.find({}).toArray();
    
        if(parkReview === null)
            throw 'No review present with that Id';

        parkReview.forEach(element => {
            if(element._id.toString() === parkReview.parkingId.toString()) {
                element.parkingReviews.forEach(data => {
                    avgRating += data.rating;
                })
                avgRating = (avgRating/element.parkingReviews.length);
            }
        });
    
        const ratingUpdate = await parkingCollection.updateOne(
            {_id: ObjectId(parkReview.parkingId)},
            {$set: {overallRating: avgRating}}
        )
    
        if(!ratingUpdate.matchedCount && !ratingUpdate.modifiedCount)
            throw 'Update of the rating has been failed';

        return await this.getReview(reviewId);
    }
}

module.exports = exportedMethods;