// /routes/userRoutes.js
const express = require('express');
const { registerUser } = require('../controllers/userController');
const { getCardholderDetails } = require('../controllers/userController');

const {fundWallet} = require('../controllers/userController');






const router = express.Router();

router.post('/register-cardholder', registerUser);

router.get('/getcardholders/:cardholder_id', getCardholderDetails);

router.patch('/fund',fundWallet);

module.exports = router;
