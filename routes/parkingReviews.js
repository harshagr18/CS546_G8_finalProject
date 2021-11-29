const express = require('express');
const router = express.Router();
const data = require('../data');
const parkingsData = data.parkings;
const reviewData = data.parkingReviews;
const { ObjectId } = require('mongodb');

router.get('/:id', async (req, res) => {
    try {
        console.log("Inside get of writeareview");
        const reviewParking = await parkingsData.getParking(req.params.id);
        res.json(reviewParking);
    } catch(e) {
        res.status(404).json({ error: 'Parking not found' });
        return;
    }
});

router.get('/userreviews/:id', async (req, res) => {
    try {
        const reviewsOfUser = await reviewData.getAllReviewsOfUser(req.params.id);
        res.json(reviewsOfUser);
    } catch(e) {
        res.status(404).json({ error: 'Reviews of user not found' });
        return;
    }
});

router.get('/parkingreviews/:id', async (req, res) => {
    try {
        const reviewsOfParking = await reviewData.getAllReviewsOfParking(req.params.id);
        res.json(reviewsOfParking);
    } catch(e) {
        res.status(404).json({ error: 'Reviews of parking not found' });
        return;
    }
});

router.post('/:id', async (req, res) => {
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

router.put("/:id", async(req, res) => {
    let updateReviewInfo = req.body;

    try {
        await parkingsData.getParking(req.params.id);
    } catch (e) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
    }

    try {
        const updatedReview = await reviewData.updateReview(req.params.id,
            updateReviewInfo.rating,
            updateReviewInfo.comment
        );
        res.json(updatedReview);
    } catch(e) {
        res.status(500).json({ error: e });
    }
});

router.delete('/:id', async(req, res) => {
    try {
        await parkingsData.getParking(req.params.id);
    } catch(e) {
        res.status(404).json({ error: 'Parking not found' });
        return;
    }

    try {
        const deletedReview = await reviewData.removeReview(req.params.id);
        res.json(deletedReview);
    } catch (e) {
        res.status(404).json({ error: 'Review cannot be deleted due to some error' });
    }
});

module.exports = router;