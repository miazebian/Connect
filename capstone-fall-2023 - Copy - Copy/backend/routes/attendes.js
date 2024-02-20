const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { User } = require('../schemas');
const Attendee = mongoose.model('Attendee'); // Make sure you have the Attendee model defined
const Notification=mongoose.model('Notification');
const Event=mongoose.model('Event');

// Create an attendee
router.post('/attendees', async (req, res) => {
  try {
    const { userId, eventId } = req.body;
    const attendee = new Attendee({ userId, eventId });
    
    await attendee.save();

    const event = await Event.findById(eventId);
    const user=await User.findById(userId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Find the user who created the event
    const eventCreator = await User.findById(event.organizerId);

    if (!eventCreator) {
      return res.status(404).json({ error: 'Event creator not found' });
    }

    const not=new Notification({
      userId: eventCreator,
      message:`${user.username} is attending your ${event.eventName} event`,
      type:"Attending Event",
      isRead:false,
      eventId:eventCreator
    })

    await not.save();

    res.status(201).json(attendee);
  } catch (error) {
    console.error('Create attendee error:', error);
    res.status(500).json({ error: 'Failed to create attendee' });
  }
});


// Delete an attendee by userId and eventId
router.delete('/deleteattendees', async (req, res) => {
  try {
    const { userId, eventId } = req.body; // Assuming you pass userId and eventId in the request body

    console.log(userId);
    const deletedAttendee = await Attendee.findOneAndDelete({ userId, eventId });

    console.log(deletedAttendee);
    if (!deletedAttendee) {
      return res.status(404).json({ error: 'Attendee not found' });
    }

    res.status(200).json({ message: 'Attendee deleted' });
  } catch (error) {
    console.error('Delete attendee error:', error);
    res.status(500).json({ error: 'Failed to delete attendee' });
  }
});


// Get all attendees for a specific event (by eventId)
router.get('/attendees/event/:eventId', async (req, res) => {
    try {
      const eventId = req.params.eventId;
      const attendees = await Attendee.find({ eventId }).populate('userId');
      res.status(200).json(attendees);
    } catch (error) {
      console.error('Get attendees by event error:', error);
      res.status(500).json({ error: 'Failed to get attendees by event' });
    }
  });

  // Get all events that a specific user is attending (by userId)
router.get('/events/attending/user/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const eventsAttending = await Attendee.find({ userId }).populate('eventId');
      res.status(200).json(eventsAttending);
    } catch (error) {
      console.error('Get events attending by user error:', error);
      res.status(500).json({ error: 'Failed to get events attending by user' });
    }
  });
  
  // Check if a user is attending a specific event (by userId and eventId)
router.get('/event/attendance/:userId/:eventId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const eventId = req.params.eventId;

    // Check if the user is attending the event
    const attendee = await Attendee.findOne({ userId, eventId });

    if (attendee) {
      // The user is attending the event
      res.status(200).json(attendee);
    }
  } catch (error) {
    console.error('Check event attendance error:', error);
    res.status(500).json({ error: 'Failed to check event attendance' });
  }
});

module.exports = router;
