const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

// Define the route for creating a card
router.post('/create', cardController.createCard);

router.get('/get-details', cardController.getCardDetails);


router.get('/get-complete-details', cardController.getCompleteCardDetails);

router.get('/get-card-balance', cardController.getCardBalance);

router.patch('/fund',cardController.fundCard);
// 




module.exports = router;
