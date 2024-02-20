const express = require('express');
const router = express.Router();
const geolib = require('geolib');

const authenticateToken = require('../middleware');

const schemas = require('../schemas');
const User = schemas.User;

router.put('/set-location', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { latitude, longitude } = req.body;//get from browser navigator in front-end

    // Update the user's location
    await User.findByIdAndUpdate(userId, { location: { type: 'Point', coordinates: [longitude, latitude] } });

    res.status(200).json({ message: 'User location updated' });
  } catch (error) {
    console.error('Set location error:', error);
    res.status(500).json({ error: 'Location update failed' });
  }
});

router.get('/find-nearby-users', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user || !user.location) {
      return res.status(404).json({ error: 'User or location not found' });
    }

    const userCoordinates = user.location.coordinates;
    const maxDistance = 1000; //  within 1000 meters

    const nearbyUsers = await User.find({
      _id: { $ne: userId }, // not the user who made the request
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: userCoordinates },
          $maxDistance: maxDistance,
        },
      },
    });



    res.status(200).json(nearbyUsers);
  } catch (error) {
    console.error('Find nearby users error:', error);
    res.status(500).json({ error: 'Finding nearby users failed' });
  }
});


module.exports = router;