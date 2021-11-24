const mongoCollections = require('../config/mongoCollections');
const parkings = mongoCollections.parkings
const parkingReviews = mongoCollections.parkingReviews
const {ObjectId} = require('mongodb');

let exportedMethods = {
    async createReview(parkingId, userId, rating, comment) {
        const parkingCollection = await parkings();
        const checkParking = await parkingCollection.findOne({ _id: ObjectId(parkingId)});
        
        if(checkParking === null)
            throw 'Parking does not exist';

        const newReview = {
            _id: new ObjectId(),
            parkingId: parkingId,
            userId: userId,
            rating: rating,
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

        arrayOfObject.forEach(element => {
            element.reviews.forEach(data => {
                avgRating += data.rating;
            });
        });

        avgRating = (avgRating/sameReview.reviews.length);

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
            if(typeof parkingSpace[key] === 'object' && key === "reviews") {
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
    }
}