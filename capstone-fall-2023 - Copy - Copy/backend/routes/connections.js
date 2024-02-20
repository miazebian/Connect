const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authenticateToken = require('../middleware');

const schemas = require('../schemas');
const User = schemas.User;
const Connection = schemas.Connection;
const Notification=schemas.Notification;

router.post('/send-connection-request/:userAId/:userBId', authenticateToken, async (req, res) => {
  try {
    const userAId = req.params.userAId;
    const userBId = req.params.userBId;

    // Check if the users with provided IDs exist
    const userA = await User.findById(userAId);
    const userB = await User.findById(userBId);

    if (!userA || !userB) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a new connection request
    const connection = new Connection({
      userAId,
      userBId,
      status: 'pending'
    });

    const not=new Notification({
      userId: userBId,
      message:`Received Connection Request from ${userA.username}`,
      type:"Connection Request",
      isRead:false
    })

    await connection.save();
    await not.save();

    res.status(200).json({ message: 'Connection request sent' });
  } catch (error) {
    console.error('Connection request error:', error);
    res.status(500).json({ error: 'Connection request failed' });
  }
});




router.put('/accept-connection-request', authenticateToken, async (req, res) => {
  try {
    const { userAId, userBId } = req.body;

    // Find the connection where userAId and userBId match and status is 'pending'
    const connection = await Connection.findOne({ userAId, userBId, status: 'pending' });

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Updating the connection status to 'accepted'
    connection.status = 'accepted';
    await connection.save();

    res.status(200).json({ message: 'Connection accepted' });
  } catch (error) {
    console.error('Accept connection error:', error);
    res.status(500).json({ error: 'Connection acceptance failed' });
  }
});


router.delete('/decline-connection-request', authenticateToken, async (req, res) => {
  try {
    const { userAId, userBId } = req.body;

    // Find the connection where userAId and userBId match and status is 'pending'
    const connection = await Connection.findOneAndDelete({ userAId, userBId, status: 'pending' });

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    res.status(200).json({ message: 'Connection declined' });
  } catch (error) {
    console.error('Decline connection error:', error);
    res.status(500).json({ error: 'Connection decline failed' });
  }
});


router.get('/list-connection-requests-sent', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    // Find connection requests 
    // where the user's ID is in the 'userAId' field (sender)
    // and the status is 'pending'
    const requestsSent = await Connection.find({ userAId: userId, status: 'pending' });

    res.status(200).json(requestsSent);
  } catch (error) {
    console.error('List connection requests sent error:', error);
    res.status(500).json({ error: 'Request retrieval failed' });
  }
});

router.get('/list-connection-requests-received/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find connection requests 
    // where the user's ID is in the 'userBId' field (recipient)
    // and the status is 'pending'
    const requestsReceived = await Connection.find({ userBId: userId, status: 'pending' });

    res.status(200).json(requestsReceived);
  } catch (error) {
    console.error('List connection requests received error:', error);
    res.status(500).json({ error: 'Request retrieval failed' });
  }
});

router.get('/list-connections/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find connections where the user is either sender of the connection request (userA)
    //  or recipient of the request (userB)
    //  and the status is 'accepted'
    const connections = await Connection.find({
      userAId: userId,
      status: 'accepted',
    });
    res.status(200).json(connections);
  } catch (error) {
    console.error('List connections error:', error);
    res.status(500).json({ error: 'List connections failed' });
  }
});

router.delete('/remove-connection', authenticateToken, async (req, res) => {
  try {
    const { connectionId } = req.body;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Check if the user trying to delete is part of the connection
    if (
      String(connection.userAId) !== String(req.userId) &&
      String(connection.userBId) !== String(req.userId)
    ) {
      return res.status(403).json({ error: 'Unauthorized to remove this connection' });
    }

    // Delete the connection document from the database using deleteOne
    const result = await Connection.deleteOne({ _id: connectionId });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: 'Connection removed' });
    } else {
      res.status(500).json({ error: 'Connection removal failed' });
    }
  } catch (error) {
    console.error('Remove connection error:', error);
    res.status(500).json({ error: 'Connection removal failed' });
  }
});

router.get('/check-connection/:userAId/:userBId', authenticateToken, async (req, res) => {
  try {
    const userAId = req.params.userAId;
    const userBId = req.params.userBId;


    // Check if there is a connection between userAId and userBId with the status 'accepted'
    const connection = await Connection.findOne({
         userAId: userAId, userBId: userBId, status: 'accepted' ,
       // { userAId: userBId, userBId: userAId, status: 'accepted' },
    });

    if (connection) {
      res.status(200).json({ connected: true });
    }
  } catch (error) {
    console.error('Check connection error:', error);
    res.status(500).json({ error: 'Check connection failed' });
  }
});

router.get('/check-pending/:userAId/:userBId', authenticateToken, async (req, res) => {
  try {
    const userAId = req.params.userAId;
    const userBId = req.params.userBId;

    const connection = await Connection.findOne({
      $or: [
        { userAId: userAId, userBId: userBId, status: 'pending' },
      ],
    });

    if (connection) {
      res.status(200).json({ connected: true });
    } else {
      res.status(401).json({error: 'connected: false' });
    }
  } catch (error) {
    console.error('Check connection error:', error);
    res.status(500).json({ error: 'Check connection failed' });
  }
});

module.exports = router;