// seedData.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel'); // Import your user model

dotenv.config(); // Load environment variables

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Dummy Data
const users = [
  {
    first_name: 'John',
    last_name: 'Doe',
    address: {
      address: '9 Jibowu Street',
      city: 'Aba North',
      state: 'Abia',
      country: 'Nigeria',
      postal_code: '1000242',
      house_no: '13',
    },
    phone: '08122277789',
    email_address: 'john.doe@gmail.com',
    identity: {
      id_type: 'NIGERIAN_BVN_VERIFICATION',
      bvn: '22222222222222',
      selfie_image: 'https://image.com/selfie.jpg',
    },
  },
  {
    first_name: 'Jane',
    last_name: 'Smith',
    address: {
      address: '15 Obafemi Street',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      postal_code: '100234',
      house_no: '2',
    },
    phone: '09011234567',
    email_address: 'jane.smith@gmail.com',
    identity: {
      id_type: 'NIGERIAN_BVN_VERIFICATION',
      bvn: '33333333333333',
      selfie_image: 'https://image.com/selfie2.jpg',
    },
  },
  // Add more dummy users if necessary
];

// Function to insert data into the database
const insertData = async () => {
  try {
    await User.deleteMany(); // Delete existing users to avoid duplicates
    await User.insertMany(users); // Insert the dummy data
    console.log('Dummy data inserted successfully!');
    process.exit();
  } catch (error) {
    console.error('Error inserting data:', error);
    process.exit(1);
  }
};

// Run the function
const seed = async () => {
  await connectDB();
  await insertData();
};

seed();
