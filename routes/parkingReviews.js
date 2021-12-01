const express = require('express');
const router = express.Router();
const data = require('../data');
const parkingsData = data.parkings;
const reviewData = data.parkingReviews;
const errorCheck = require('../data/errorHandling')
const { ObjectId } = require('mongodb');

router.get('/:id', async (req, res) => {
    if(!errorCheck.checkId(req.params.id.trim())) {
        res.status(400).json({error: "You must supply a valid Parking Id"});
        return;
    }

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
    if(!errorCheck.checkId(req.params.id.trim())) {
        res.status(400).json({error: "You must supply a valid Parking Id"});
        return;
    }

    try {
        const reviewsOfUser = await reviewData.getAllReviewsOfUser(req.params.id);
        res.json(reviewsOfUser);
    } catch(e) {
        res.status(404).json({ error: 'Reviews of user not found' });
        return;
    }
});

router.get('/parkingreviews/:id', async (req, res) => {
    if(!errorCheck.checkId(req.params.id.trim())) {
        res.status(400).json({error: "You must supply a valid Parking Id"});
        return;
    }

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

    if(!errorCheck.checkId(req.params.id.trim())) {
        res.status(400).json({error: "You must supply a valid Parking Id"});
        return;
    }

    if(!errorCheck.checkRating(reviewInfo.rating)) {
        res.status(400).json({error: "You must supply a valid Rating"});
        return;
    }

    if(!errorCheck.checkString(reviewInfo.dateOfReview.trim())) {
        res.status(400).json({error: "You must supply a valid Date"});
        return;
    }

    if(!errorCheck.checkString(reviewInfo.comment.trim())) {
        res.status(400).json({error: "You must supply a valid Date"});
        return;
    }

    if(!errorCheck.checkDate(reviewInfo.dateOfReview.trim())) {
        res.status(400).json({error: "Date provided is not in proper format"});
        return;
    }

    let compareDate = reviewInfo.dateOfReview.replace(/\//g, "");
  
    if(parseInt(compareDate.substring(0,4)) === 229 || parseInt(compareDate.substring(0,4)) === 230 || parseInt(compareDate.substring(0,4)) === 231) {
        res.status(400).json({ error: 'The month of February only contains 28 days. Please enter correct date' });
        return;
    }

    if(parseInt(compareDate.substring(0,4)) === 431 || parseInt(compareDate.substring(0,4)) === 631 || parseInt(compareDate.substring(0,4)) === 931 || parseInt(compareDate.substring(0,4)) === 1131) {
        res.status(400).json({ error: 'The month mentioned only contains 30 days. Please enter correct date' });
        return;
    }

    let currentDate = new Date(); 
    let dateTime =  + (currentDate.getMonth()+1)  + "/"
                    + currentDate.getDate() + "/" 
                    + currentDate.getFullYear();
    
    dateTime = dateTime.replace(/\//g, ""); 
    dateTime = dateTime.substring(0,8);
    dateTime = parseInt(dateTime);

    if(compareDate < dateTime) {
        res.status(400).json({ error:'The date provided is not of the current day but it is of previous days'});
        return;
    }
    else if(compareDate > dateTime) {
        res.status(400).json({ error:'The date provided is not of the current day but it is of next days'});
        return;
    }

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

    if(!errorCheck.checkId(req.params.id.trim())) {
        res.status(400).json({error: "You must supply a valid Parking Id"});
        return;
    }

    if(!errorCheck.checkRating(updateReviewInfo.rating)) {
        res.status(400).json({error: "You must supply a valid Rating"});
        return;
    }

    if(!errorCheck.checkString(updateReviewInfo.comment.trim())) {
        res.status(400).json({error: "You must supply a valid Date"});
        return;
    }

    try {
        await reviewData.getReview(req.params.id);
    } catch (e) {
        res.status(404).json({ error: 'Review not found' });
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
    if(!errorCheck.checkId(req.params.id.trim())) {
        res.status(400).json({error: "You must supply a valid Parking Id"});
        return;
    }

    try {
        await reviewData.getReview(req.params.id);
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