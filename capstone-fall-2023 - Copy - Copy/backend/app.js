// setting up the server
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
   app.use(express.urlencoded({ extended: false }));


// connecting to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;

connection.once('open', () => {
    console.log('Established MongoDB connection successfully');
  });
  
  //routers
  const usersRouter = require('./routes/users.js');
  const connectionsRouter = require('./routes/connections.js');
  const eventsRouter = require('./routes/events.js');
  const geoRouter = require('./routes/geolocation.js');
  const notificaitonsRouter = require('./routes/notifications.js');
  const contactus=require('./routes/contactus.js');
  const attendee=require('./routes/attendes.js');
  const review=require('./routes/review.js');
  const message=require('./routes/messages.js');
  const group=require('./routes/group.js');

//use routers with base paths
  app.use('/users', usersRouter);
  app.use('/connections', connectionsRouter);
  app.use('/events', eventsRouter);
  app.use('/geolocation', geoRouter);
  app.use('/notifications', notificaitonsRouter);
  app.use('/contactus', contactus);
  app.use('/attendee', attendee);
  app.use('/review',review);
  app.use('/message',message);
  app.use('/group',group);
app.use('/api/profile-pics', express.static('uploads'));
app.use('/api/background-pics', express.static('uploadsback'));
app.use('/api/events-pics', express.static('uploadsevents'));

  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });