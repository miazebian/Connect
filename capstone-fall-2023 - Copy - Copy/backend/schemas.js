const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  university: String,
  academicMajor: String,
  role: String, // 'alumni' or 'student'
  graduationYear: Number,
  industry: String,
  careerLevel: String,
  educationLevel: String,
  company: String,
  jobTitle: String,
  yearsOfExperience: Number,
  country: String,
  city: String,
  location: { type: { type: String }, coordinates: [Number] }, // For geolocation
  about: String,
  experience: [String],
  skills:[String],
  educationinfo: String,
  profilePic: String,
  backgroundPic: String,
  isOn:Boolean,

});

const recommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recommendedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  score: Number,
  timestamp: { type: Date, default: Date.now },
});



const eventSchema = new mongoose.Schema({
  eventName: String,
  eventDate: Date,
  eventType: String,
  eventLocation: { type: { type: String }, coordinates: [Number] },
  description: String,
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  eventPic: String,
});

const connectionSchema = new mongoose.Schema({
  userAId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //sender
  userBId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //reciever
  status: String, // 'pending', 'accepted', or 'declined'
});

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  type: String, // e.g., 'friend request', 'new message'
  isRead: Boolean,
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
}, {timestamps:true});

const attendeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event', // Reference to the Event model
    required: true,
  },
});

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event', // Reference to the Event model
    required: true,
  },
  ReviewDate: {
    type: Date,
    required: true
},
ReviewText: {
    type: String,
    required: true
},
});

const MessageSchema = new mongoose.Schema({
  ChatUsers:{
   type:Array,
   require:true,
  },
  message:{
   type:String,
   require: true,
  },
  Sender:{
   type:mongoose.Schema.Types.ObjectId,
   require:true,
  },
  Name:{
     type:String,
  },
  id:{
     type:mongoose.Schema.Types.ObjectId,
  },
  attachment:{
     type:String, // store the path of the uploaded file
  }

}, {timestamps:true});

const GroupSchema = new mongoose.Schema({
  Sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  },
  Receiver: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  Status: {
      type: String,
  },
  Name:{
      type: String,
  },
  
},
{
  timestamps: true
},
{
  collection: 'connections'
}

)


// Defining models 
const User = mongoose.model('User', userSchema);
const Recommendation = mongoose.model('Recommendation', recommendationSchema);
const Event = mongoose.model('Event', eventSchema);
const Connection = mongoose.model('Connection', connectionSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const Attendee = mongoose.model('Attendee', attendeeSchema);
const Review = mongoose.model('Review', reviewSchema);
const Message=mongoose.model('Message',MessageSchema);
const Group=mongoose.model('Group', GroupSchema);

module.exports = {
  User,
  Recommendation,
  Event,
  Connection,
  Notification,
  Attendee,
  Review,
  Message,
  Group
};
