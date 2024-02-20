const express = require('express');
const router = express.Router();
const geolib = require('geolib');

const multer1 = require('multer');

const authenticateToken = require('../middleware');

const schemas = require('../schemas');
const User = schemas.User;
const Event = schemas.Event;
const Attendee = schemas.Attendee;
const Notification=schemas.Notification;
const path = require('path');
const fs = require('fs');

const uploadDirectory = 'uploadsevents';
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const storage = multer1.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploadsevents/'); // Destination folder for file uploads
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with a timestamp
    const uniqueFileName = `${req.params.userId}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  },
});

const upload = multer1({ storage: storage });

function getCurrentDate() {
    const now = new Date(); // Create a Date object with the current date and time
  
    // Extract date components (year, month, day, hours) in UTC
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1; // Months are zero-indexed, so add 1
    const day = now.getUTCDate();
    const hours = now.getUTCHours();
  
    // Format the date in the desired format (e.g., "YYYY-MM-DD HH:MM:SS")
    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hours).padStart(2, '0')}:00:00`;
  
    return formattedDate;
  }

  router.post('/create-event/:userId', upload.single('backgroundPic'), async (req, res) => {
    try {
      const userId = req.params.userId;

      console.log('Form Data:', req.body);
  
      const eventName = req.body.eventName;
      console.log(eventName);

      const eventDate = req.body.eventDate;
      console.log(eventDate);

      const eventLocation = JSON.parse(req.body.eventLocation);
      console.log(eventLocation);

      const description = req.body.description;
      console.log(description);

      const eventType = req.body.eventType;
      console.log(eventType);

  
      console.log(req.file);
  
      if (req.file) {
        // Create a new event document
        const event = new Event({
          eventName,
          eventDate,
          eventLocation,
          description,
          organizerId: userId,
          eventType,
          eventPic: req.file.filename,
        });
        await event.save();
        res.status(201).json({ message: 'Event created successfully' });
        return;
      }
  
      // If there's no file, create an event without the eventPic property
      const event = new Event({
        eventName,
        eventDate,
        eventLocation,
        description,
        organizerId: userId,
        eventType,
      });
  
      // Save the event to the database
      await event.save();
  
      res.status(201).json({ message: 'Event created successfully' });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Event creation failed' });
    }
  });
  
//list all events managed by a certian user (present or future)
router.get('/list-management-events/:userId', authenticateToken, async (req, res) => {
    const userId = req.params.userId;
    try {
      const events = await Event.find({ organizerId: userId}).populate('organizerId');

      res.status(200).json(events);
    } catch (error) {
      console.error('List events error:', error);
      res.status(500).json({ error: 'Event retrieval failed' });
    }
});

//list all available events
router.get('/list-events', authenticateToken, async (req, res) => {
    const currentDate = getCurrentDate();
  try {
    const events = await Event.find({ date: { $gte: currentDate } });

   // console.log(events);
    if(events){
    res.status(200).json(events);
    }
    else{
      return res.status(201).json("No events");
    }
  } catch (error) {
    console.error('List events error:', error);
    res.status(500).json({ error: 'Event retrieval failed' });
  }
});

//list all events a user is signed up for in the present or future
router.get('/list-my-events', authenticateToken, async (req, res) => {
    try {
      const { userId } = req.user;
      const currentDate = getCurrentDate(); // Get the current date
  
      // Find the IDs of events the user is signed up for that are on or after the current date
      const attendeeEvents = await Attendee.find({ userId }).populate('eventId');
      
      // Filter the events to include only those on or after the current date
      const upcomingEvents = attendeeEvents.filter((attendeeEvent) => {
        const eventDate = attendeeEvent.eventId.date;
        return eventDate >= currentDate;
      });
  
      // Extract event details from the filtered events
      const events = upcomingEvents.map((attendeeEvent) => attendeeEvent.eventId);
  
      res.status(200).json(events);
    } catch (error) {
      console.error('List my events error:', error);
      res.status(500).json({ error: 'Event retrieval failed' });
    }
});


router.get('/event-details/:eventId',authenticateToken, async (req, res) => {
    try {
      const eventId = req.params.eventId;
      const event = await Event.findById(eventId).populate('organizerId');;
  
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      // Find the list of attendees for the event
      const attendees = await Attendee.find({ eventId });

      event.attendees = attendees; // Attach the list of attendees to the event

      res.status(200).json(event);
    } catch (error) {
      console.error('Event details retrieval error:', error);
      res.status(500).json({ error: 'Event details retrieval failed' });
    }
});

router.post('/sign-up-for-event', authenticateToken, async (req, res) => {
    try {
      const { eventId } = req.body;
      const userId = req.userId;
  
      // Check if the user is already signed up
      const existingAttendee = await Attendee.findOne({ userId, eventId });
  
      if (existingAttendee) {
        return res.status(400).json({ error: 'Already signed up for this event' });
      }
  
      // Create a new attendee entry for the user and event
      const attendee = new Attendee({ userId, eventId });
      await attendee.save();
  
      res.status(200).json({ message: 'Signed up for the event' });
    } catch (error) {
      console.error('Sign up for event error:', error);
      res.status(500).json({ error: 'Sign-up for event failed' });
    }
});

router.delete('/delete-event/:userId/:eventId', authenticateToken, async (req, res) => {
    try {
      const userId = req.params.userId
      const eventId  = req.params.eventId;
  
      
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      // Check if user is the organizer of the event
      if (event.organizerId.toString() !== userId) {
        return res.status(403).json({ error: 'Unauthorized to delete this event' });
      }

      const attendeesToDelete = await Attendee.find({ eventId: eventId });

    // Get the userId of all attendeesToDelete
    const userIdsToDelete = attendeesToDelete.map((attendee) => attendee.userId);

    // Get the user of the event
    const organizer = await User.findById(event.organizerId);

    for (const deletedUserId of userIdsToDelete) {
      const notification = new Notification({
        userId: deletedUserId,
        message: `Event ${event.eventName} by organizer ${organizer.username} has been deleted.`,
        type: 'event_deleted',
        isRead: false,
      });

      await notification.save();
    }

    // Delete all attendees associated with the event
    await Attendee.deleteMany({ eventId: eventId });

      // Remove the event from the database
      await Event.deleteOne({ _id: eventId });
  
      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ error: 'Event deletion failed' });
    }
  });

  router.get('/find-nearby-events/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const { latitude, longitude } = req.query; // Query parameters for the location
  
      // Find nearby events within a specified radius (e.g., 10000 meters)
      const maxDistanceInMeters = 10000; // Adjust this value as needed
      const allEvents = await Event.find({});
     
      // Convert empty coordinates to (0,0)
      allEvents.forEach((event) => {
        if (!event.eventLocation.coordinates || event.eventLocation.coordinates.length === 0) {
          event.eventLocation.coordinates = [0, 0];          
        }
      });


      const nearbyEvents = allEvents.filter((event) => {
        if (
          event.eventLocation.coordinates &&
          event.eventLocation !== undefined &&
          event.organizerId.toString() !== userId
        ) {
          if (event.eventLocation.coordinates.length >= 2) {
            const eventCoordinates = event.eventLocation.coordinates; // Replace with your event data field name for coordinates
            const eventLatitude = eventCoordinates[0]; // Replace with the index for latitude
            const eventLongitude = eventCoordinates[1]; // Replace with the index for longitude
            const distance = geolib.getDistance(
              { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
              { latitude: eventLatitude, longitude: eventLongitude }
            );
           // console.log(distance);
            return distance <= maxDistanceInMeters;
          }
        }
        return false; // Skip events without valid coordinates or events organized by the user
      });

      
     // console.log(nearbyEvents);
      res.status(200).json({ nearbyEvents });
    } catch (error) {
      console.error('Find nearby events error:', error);
      res.status(500).json({ error: 'Find nearby events failed' });
    }
  });
  

router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const regexPattern = new RegExp(query, 'i');

    const events = await Event.find({
      $or: [
        { eventName: { $regex: regexPattern } },
        //{ eventDate: { $regex: regexPattern } },
        { eventLocation: { $regex: regexPattern } },
        { description: { $regex: regexPattern } },
        { eventType: { $regex: regexPattern } },
      ],
    });

    res.status(200).json(events);
  } catch (error) {
    console.error('Event search error:', error);
    res.status(500).json({ error: 'Event search failed' });
  }
});


router.get('/eventToday/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get the current date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to the beginning of the day

    // Find events with the specified organizerId and eventDate equal to today
    const events = await Event.find({
      organizerId: userId,
      eventDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }, // Events today
    });

    for (const event of events) {
      // Check if a notification with the same userId and message already exists
      const existingNotification = await Notification.findOne({
        userId: userId,
        message: `Event today: ${event.eventName}`,
      });

      // If no existing notification is found, create a new one
      if (!existingNotification) {
        const notification = new Notification({
          userId: userId,
          message: `Event today: ${event.eventName}`,
          type: 'Comment',
          isRead: false,
          eventId: event._id,
        });

        await notification.save();
      }
    }

    res.status(200).json({ message: 'Notifications created successfully' });
  } catch (error) {
    console.error('Create notifications error:', error);
    res.status(500).json({ error: 'Failed to create notifications' });
  }
});


module.exports = router;