const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware');

const schemas = require('../schemas');
const Notification =schemas.Notification;
const User=schemas.User;


router.get('/notifications/unread/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Find all notifications for the user where isRead is false
      const notifications = await Notification.find({ userId, isRead: false }).sort({createdAt:-1});
  
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      res.status(500).json({ error: 'Failed to get unread notifications' });
    }
  });
  

  router.get('/notifications/read/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Find all notifications for the user where isRead is true
      const notifications = await Notification.find({ userId, isRead: true }).sort({createdAt:-1});
  
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error getting read notifications:', error);
      res.status(500).json({ error: 'Failed to get read notifications' });
    }
  });
  
  router.put('/notifications/mark-read/:notificationId', async (req, res) => {
    try {
      const notificationId = req.params.notificationId;
  
      // Find the notification by its ID
      const notification = await Notification.findById(notificationId);
  
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
  
      // Update the isRead property to true
      notification.isRead = true;
      await notification.save();
  
      res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });
  
  router.put('/notifications/markreadmessage/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Update notifications with the specified userId and type="message" to set isRead to true
      const result = await Notification.updateMany({ userId, type: 'message' }, { $set: { isRead: true } });
  
      if (result.nModified > 0) {
        res.status(200).json({ message: 'Notifications marked as read' });
      } else {
        return res.status(404).json({ error: 'No matching notifications found' });
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
  });
  


// Router to update the 'isOn' boolean value in User by userId
router.put('/user/updateIsOn/:userId/:isOn', async (req, res) => {
  try {
    const userId = req.params.userId;
    const isOn= req.params.isOn;


    await User.findByIdAndUpdate(userId, { isOn });

    res.status(200).json({ message: 'isOn value updated successfully' });
  } catch (error) {
    console.error('Error updating isOn value:', error);
    res.status(500).json({ error: 'Failed to update isOn value' });
  }
});

// Router to retrieve the 'isOn' boolean value from User by userId
router.get('/user/isOn/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user and retrieve the 'isOn' value
    const user = await User.findById(userId, 'isOn');


    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if(user.isOn===undefined){
      user.isOn=true;
    }

    res.status(200).json({ isOn: user.isOn });
  } catch (error) {
    console.error('Error retrieving isOn value:', error);
    res.status(500).json({ error: 'Failed to retrieve isOn value' });
  }
});



/*
  router.delete('/notifications', async (req, res) => {
    try {
      // Delete all notifications
      await Notification.deleteMany({});
  
      res.status(200).json({ message: 'All notifications deleted successfully' });
    } catch (error) {
      console.error('Error deleting notifications:', error);
      res.status(500).json({ error: 'Failed to delete notifications' });
    }
  });
*/

module.exports = router;