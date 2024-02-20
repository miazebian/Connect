const express = require('express');
const router = express.Router();

const schemas = require('../schemas');
const Group = schemas.Group;

// Create Group Connection
router.post('/create-group-connection/:send', async (req, res) => {
  const Sender = req.params.send;
  const Receiver = req.body.Receiver;
  const GroupName = req.body.Name;

  const group = new Group({
    Sender,
    Receiver,
    Status: 3,
    Name: GroupName,
  });

  try {
    await Group.create(group);
    res.status(201).json({ group });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

// Get Group
router.get('/get-group/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const findgroup = await Group.find({
      $or: [{ Sender: id }, { Receiver: { $in: [id] }}]
      });

    if (!findgroup) {
      return res.status(204).json({ message: 'No Connection Found' });
    }
    res.status(200).json(findgroup);
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;
