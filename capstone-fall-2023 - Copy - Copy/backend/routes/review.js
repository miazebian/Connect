const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const geolib = require('geolib');

const authenticateToken = require('../middleware');

const schemas = require('../schemas');
const User = schemas.User;
const Review=schemas.Review;
const Notification=schemas.Notification;
const Event=schemas.Event;

router.post('/create-review/:userId/:eventId', async (req, res) => {
  try {
    const userId=req.params.userId;
    const eventId=req.params.eventId;
    const {ReviewText} = req.body;

    const event = await Event.findById(eventId);
    const eventCreator = await User.findById(event.organizerId);
    const user=await User.findById(userId);

    // Create a new review document with the current date
    const review = new Review({
      userId,
      eventId,
      ReviewText,
      ReviewDate: new Date(),
    });

    const not=new Notification({
      userId: eventCreator,
      message: `${user.username} left a comment on your ${event.eventName} event`,
      type:"Comment",
      isRead:false,
      eventId: event._id
    })
    await not.save();


    // Save the review to the database
    await review.save();

    res.status(201).json({ message: 'Review created successfully' });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Review creation failed' });
  }
});

module.exports = router;


router.delete('/delete-review/:reviewId', async (req, res) => {
    try {
        const reviewId = req.params.reviewId;

        const deletedReview = await Review.findByIdAndDelete(reviewId);
        if (!deletedReview) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ error: 'Review deletion failed' });
    }
});

  
  router.get('/event-reviews/:eventId', async (req, res) => {
    try {
      const eventId = req.params.eventId;
      // Find all reviews for the specified event
      const reviews = await Review.find({ eventId });
      
      // Create an array to store user information along with reviews
      const reviewsWithUserInfo = [];
  
      for (const review of reviews) {
        const user = await User.findById(review.userId);
  
        if (user) {
          reviewsWithUserInfo.push({
            reviewDate: review.ReviewDate,
            reviewText: review.ReviewText,
            id:review._id,
            eventId:review.eventId,
            user: user,
          });
        }
      }
      console.log(reviewsWithUserInfo);

      res.status(200).json(reviewsWithUserInfo);
    } catch (error) {
      console.error('Get event reviews error:', error);
      res.status(500).json({ error: 'Failed to retrieve event reviews' });
    }
  });
  

module.exports = router;