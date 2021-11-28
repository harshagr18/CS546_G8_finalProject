const express = require('express');
const router = express.Router();
const data = require('../data');
const parkingsData = data.parkings;
const reviewData = data.parkingReviews;
const { ObjectId } = require('mongodb');

router.get('/writeareview/:id', async (req, res) => {
    try {
        console.log("Inside get of writeareview");
        const reviewParking = await parkingsData.getParking(req.params.id);
        res.json(reviewParking);
    } catch(e) {
        res.status(404).json({ error: 'Parking not found' });
        return;
    }
});

router.post('/writeareview/:id', async (req, res) => {
    let reviewInfo = req.body;
    try {
        await parkingsData.getParking(req.params.id);
    } catch(e) {
        res.status(404).json({ error: 'Parking not found' });
        return;
    }

    try {
        const newReview = await reviewData.createReview(req.params.id,
            reviewInfo.userId.trim(),
            reviewInfo.rating,
            reviewInfo.dateOfReview.trim(),
            reviewInfo.comment.trim()
        );
        return res.status(200).json(newReview)
    } catch(e) {
        res.status(500).json({ error: e });
    }
});

module.exports = router;