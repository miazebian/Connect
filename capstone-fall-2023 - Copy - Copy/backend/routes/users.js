const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const geolib = require('geolib');
const multer = require('multer');
const mutler = require('multer');

const authenticateToken = require('../middleware');

const schemas = require('../schemas');
const User = schemas.User;

const path = require('path');
const fs = require('fs');

const uploadDirectory = 'uploads';

// Check if the 'uploads' directory exists, and create it if it doesn't.
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const uploadDic = 'uploadsback';

// Check if the 'uploads' directory exists, and create it if it doesn't.
if (!fs.existsSync(uploadDic)) {
  fs.mkdirSync(uploadDic);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Destination folder for file uploads
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with a timestamp
    const uniqueFileName = `${req.params.userId}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  },
});

const upload = multer({ storage: storage });

const background = mutler.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploadsback/'); // Destination folder for file uploads
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with a timestamp
    const uniqueFileName = `${req.params.userId}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  },
});

const uploadsback = mutler({ storage: background });



router.get('/', (req, res) => {
  res.send('Get all users');
});

router.post('/register', async (req, res) => {
  try {
    // Extracting user data from the request 
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      university,
      academicMajor,
      role,
      graduationYear,
      industry,
      careerLevel,
      educationLevel,
      company,
      jobTitle,
      yearsOfExperience,
      country,
      city,
      location,
      about,
      experience,
      skills,
      educationinfo,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Creating a new user document
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      university,
      academicMajor,
      role,
      graduationYear,
      industry,
      careerLevel,
      educationLevel,
      company,
      jobTitle,
      yearsOfExperience,
      country,
      city,
      location,
      about,
      experience,
      skills,
      educationinfo,
      isOn:true,
    });

    

    // Save the user to the database
    await newUser.save();

    return res.status(201).json({message: 'User registered successfully' });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.email === 1) {
      res.status(400).json({ error: 'Email is already in use' });
    } else if (error.code === 11000 && error.keyPattern.username === 1) {
      res.status(400).json({ error: 'Username is already taken' });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

router.post('/login',async (req, res) => {

  try {
    // Extract user login data from the  body
    const { usernameOrEmail, password } = req.body;

    // tested 
    // {     
//   "usernameOrEmail": "jDoe123",
//   "password": "password2023"
// } 


    //check if user exists with this email
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });
    
    if (!user) {
      //console.log("1234");
      return res.status(401).json({ error: 'There is no account associated with this email or username' });
    }

    // check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(300).json({ error: 'Invalid password' });
    }

    // force login to refresh token every 30 days
    const token = jwt.sign({ userId: user._id, user: user }, process.env.SECRET_KEY, { expiresIn: '30d' });

    // Send the token in the response
    res.status(200).json({ token: token, message: "User logged in", user: user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});


// these are protected routes (must be logged in)
// they require the "Authorization" header containing a valid jwt
router.put('/update', authenticateToken, async (req, res) => {
  try {
    // Get the id from the token
    const userId = req.userId;
    // Update the user's profile other than the password
    if (req.body.password) {
      delete req.body.password;
    }
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// update password as an authenticated (logged in) user
router.post('/update-password', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; //from token
    const { password } = req.body;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

router.delete('/delete', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Delete the user
    User.deleteOne({ _id: userId })
    .then(() => {
      res.json({ message: 'User deleted successfully' });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error deleting user' });
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});



router.post('/check-existence', async (req, res) => {
  try {
    const { username, email } = req.body;

    // Check if a user with the given email or username exists
    const user = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });

    if (user) {
      // If a user with the email or username already exists
      res.status(401).json({ error: 'User exists' });
    } else {
      // If no user with the email or username exists
      res.status(200).json({ message: 'User does not exist', exists: false });
    }
  } catch (error) {
    console.error('Check existence error:', error);
    res.status(500).json({ error: 'Error checking existence' });
  }
});

router.get('/getuser/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
    } else {

      res.status(200).json(user);
    }
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Error getting user by ID' });
  }
});


router.put('/updateall/:userId', upload.single('profilePic'), async (req, res) => {
  try {
    const userId = req.params.userId;
   // console.log(userId);
    const updatedUser = JSON.parse(req.body.updatedUser);
    //console.log(updatedUser);
    //console.log(req.file);

    // Check if the request includes a new password
    if (
      !/^\$2[aby]\$\d{1,2}\$[./0-9A-Za-z]{53}$/.test(updatedUser.password)
    ) {
      // If it's not hashed, hash the password
      const hashedPassword = await bcrypt.hash(updatedUser.password, 10);
      updatedUser.password = hashedPassword;
    }
    if (req.file) {
      // Add the profilePic field to the updatedUser object
      updatedUser.profilePic = req.file.filename;
    }

    // Find and update the user by ID
    const result = await User.findByIdAndUpdate(userId, updatedUser, { new: true });

    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ message: 'User account updated successfully' });
  } catch (error) {
    console.error('Account update error:', error);
    res.status(500).json({ error: 'Account update failed' });
  }
});


router.put('/updateback/:userId', uploadsback.single('backgroundPic'), async (req, res) => {
  try {
    const userId = req.params.userId;

    const updatedUser1=await User.findById(userId);

    if (req.file) {
      updatedUser1.backgroundPic = req.file.filename;
    }


    const result1 = await User.findByIdAndUpdate(userId, updatedUser1, { new: true });


    if (!result1) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ message: 'User account updated successfully' });
  } catch (error) {
    console.error('Account update error:', error);
    res.status(500).json({ error: 'Account update failed' });
  }
});


router.get('/find-nearby-users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { latitude, longitude } = req.query; // Query parameters for the location

    const maxDistanceInMeters = 10000; // Adjust this value as needed
    const allUsers = await User.find({});
    
    const nearbyUsers = allUsers.filter((user) => {
      console.log(user);
      if (user.location && user.location.coordinates && Array.isArray(user.location.coordinates) && user.location.coordinates.length >= 2 && user._id.toString() !== userId) {
      if (user.location.coordinates && user.location !== undefined) {
        if (user.location.coordinates.length >= 2 && user._id.toString() !== userId) {
          if(user.location.coordinates[0] !== null){
          const userCoordinates = user.location.coordinates; // Replace with your user data field name for coordinates
          const userLatitude = userCoordinates[0]; // Replace with the index for latitude
          const userLongitude = userCoordinates[1]; // Replace with the index for longitude
          const distance = geolib.getDistance(
            { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
            { latitude: userLatitude, longitude: userLongitude }
          );
          console.log(distance<= maxDistanceInMeters);
          return distance <= maxDistanceInMeters;
        }
      }
    }
    }
      return false; // Skip users without valid coordinates or the user making the request
    });
    
    console.log(nearbyUsers);

    res.status(200).json({ nearbyUsers });
  } catch (error) {
    console.error('Find nearby users error:', error);
    res.status(500).json({ error: 'Find nearby users failed' });
  }
});

router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    // Create a regular expression pattern for the query (case-insensitive)
    const regexPattern = new RegExp(query, 'i');

    // Search the User collection for matching records
    const users = await User.find({
      $or: [
        { firstName: { $regex: regexPattern } },
        { lastName: { $regex: regexPattern } },
        { username: { $regex: regexPattern } },
        { email: { $regex: regexPattern } },
        { university: { $regex: regexPattern } },
        { academicMajor: { $regex: regexPattern } },
        { role: { $regex: regexPattern } },
        { industry: { $regex: regexPattern } },
        { careerLevel: { $regex: regexPattern } },
        { company: { $regex: regexPattern } },
        { jobTitle: { $regex: regexPattern } },
        { country: { $regex: regexPattern } },
        { city: { $regex: regexPattern } },
        { location: { $regex: regexPattern } },
        { about: { $regex: regexPattern } },
        { educationinfo: { $regex: regexPattern } },
        // Search numeric fields (e.g., graduationYear)
        {
          graduationYear: !isNaN(query) ? parseInt(query) : null,
        },
        { yearsOfExperience: !isNaN(query) ? parseInt(query) : null },
        // Search within array fields (skills and experience)
        { skills: { $in: [regexPattern] } },
        { experience: { $in: [regexPattern] } },
        // Add other numeric fields here
      ],
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;