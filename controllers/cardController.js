const request = require('request');
const AES256 = require('aes-everywhere');  // Import AES encryption
const User = require('../models/userModel');  
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

exports.createCard = async (req, res) => {
    const { user_id, pin } = req.body;

    // Validate the user_id
    if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    // Validate the pin (must be a 4-digit number)
    if (!pin || pin.length !== 4 || isNaN(pin)) {
        return res.status(400).json({ message: 'Invalid pin. Pin must be a 4-digit number.' });
    }

    try {
        // Fetch user from the database based on user_id
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Assuming cardholder_id is stored in the user model
        const cardholder_id = user.cardholder_id;
        if (!cardholder_id) {
            return res.status(404).json({ message: 'Cardholder ID not found for this user' });
        }

        // Encrypt the 4-digit pin
        const encryptedPin = AES256.encrypt(pin, process.env.secret_key).toString();

        const options = {
            method: 'POST',
            url: `${process.env.create_card_url}`,
            headers: {
                token: process.env.API_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cardholder_id: cardholder_id,
                card_type: 'virtual',
                card_brand: 'Mastercard',
                card_currency: 'USD',
                card_limit: '500000',
                transaction_reference: '',
                funding_amount: '300',
                pin: encryptedPin, // Encrypted pin
                meta_data: {
                    user_id: user_id
                }
            })
        };

        // Send request to the API
        request(options, async (error, response) => {
            if (error) {
                return res.status(500).json({ message: 'Error creating card', error: error.message });
            }

            const responseBody = JSON.parse(response.body);

            // Check if the request was successful
            if (responseBody.status === 'success') {
                // Update the user with the card_id from the response
                const card_id = responseBody.data.card_id; 
                user.card_id = card_id;

    
                await user.save();

                return res.status(201).json({
                    message: responseBody.message,
                    data: responseBody.data
                });
            } else {
                return res.status(400).json({
                    message: responseBody.message,
                    data: responseBody.data
                });
            }
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};


exports.getCardDetails = async (req, res) => {
    const { user_id } = req.query;
  
    // Validate the user_id
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
  
    try {
      // Fetch user from the database based on user_id
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Assuming card_id is stored in the user model
      const card_id = user.card_id;
      if (!card_id) {
        return res.status(404).json({ message: 'Card ID not found for this user' });
      }
  
      // Prepare options for the Bridgecard API request to get card details
      const options = {
        'method': 'GET',
        url: `https://issuecards.api.bridgecard.co/v1/issuing/sandbox/cards/get_card_details?card_id=${card_id}`,
        headers: {
            token: process.env.API_TOKEN,
        }

        // 'url': `${card_id}`,
        // 'headers': {
        //   'token': 'Bearer *****'  // Replace with your actual token
        // }
      };
  
      // Send request to Bridgecard API to get card details
      request(options, function (error, response) {
        if (error) {
          return res.status(500).json({ message: 'Error fetching card details', error: error.message });
        }
  
        const responseBody = JSON.parse(response.body);
  
        // Check if the request was successful
        if (responseBody.status === 'success') {
          return res.status(200).json({
            message: responseBody.message,
            data: responseBody.data
          });
        } else {
          return res.status(400).json({
            message: responseBody.message,
            data: responseBody.data
          });
        }
      });
  
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
};


exports.getCompleteCardDetails = async (req, res) => {
    const { user_id } = req.query;
  
    // Validate the user_id
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
  
    try {
      // Fetch user from the database based on user_id
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Assuming card_id is stored in the user model
      const card_id = user.card_id;
      if (!card_id) {
        return res.status(404).json({ message: 'Card ID not found for this user' });
      }
  
      // Prepare options for the Bridgecard API request to get card details
      const options = {
        'method': 'GET',
        url: `https://issuecards-api-bridgecard-co.relay.evervault.com/v1/issuing/sandbox/cards/get_card_details?card_id=${card_id}`,
        headers: {
            token: process.env.API_TOKEN,
        }
      };
  
      // Send request to Bridgecard API to get card details
      request(options, function (error, response) {
        if (error) {
          return res.status(500).json({ message: 'Error fetching card details', error: error.message });
        }
  
        const responseBody = JSON.parse(response.body);
  
        // Check if the request was successful
        if (responseBody.status === 'success') {
          return res.status(200).json({
            message: responseBody.message,
            data: responseBody.data
          });
        } else {
          return res.status(400).json({
            message: responseBody.message,
            data: responseBody.data
          });
        }
      });
  
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getCardBalance = async (req, res) => {
    const { user_id } = req.query;
  
    // Validate the user_id
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
  
    try {
      // Fetch user from the database based on user_id
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Assuming card_id is stored in the user model
      const card_id = user.card_id;
      if (!card_id) {
        return res.status(404).json({ message: 'Card ID not found for this user' });
      }
  
      // Prepare options for the Bridgecard API request to get card balance
      const options = {
        'method': 'GET',
        url: `https://issuecards.api.bridgecard.co/v1/issuing/sandbox/cards/get_card_balance?card_id=${card_id}`,
        headers: {
            token: process.env.API_TOKEN,
        }
      };
  
      // Send request to Bridgecard API to get card balance
      request(options, function (error, response) {
        if (error) {
          return res.status(500).json({ message: 'Error fetching card balance', error: error.message });
        }
  
        const responseBody = JSON.parse(response.body);
  
        // Check if the request was successful
        if (responseBody.status === 'success') {
          return res.status(200).json({
            message: responseBody.message,
            data: responseBody.data
          });
        } else {
          return res.status(400).json({
            message: responseBody.message,
            data: responseBody.data
          });
        }
      });
  
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.fundCard =async (req, res) => {
    const { card_id, amount } = req.body;

    // Input validation
    if (!card_id || !amount) {
        return res.status(400).json({ error: "card_id and amount are required." });
    }

    // Convert amount to number and validate it
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: "Amount must be a positive number." });
    }

    const card = await User.findOne({ card_id: card_id });
    if (!card) {
        console.log("Card not found");
        return;
    }

}

// async function fundCard(card_id, amount) {
//     // Example options for the request
//     const transaction_reference = `${Date.now()}-${uuidv4()}`;
//     const options = {
//         'method': 'PATCH',
//         'url': `${process.env.fund_card_url}`, 
//         'headers': {
//           'token': `${process.env.API_TOKEN}`, 
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             card_id: card_id,
//             amount: amount,
//             transaction_reference: transaction_reference,
//             currency: "USD"
//         }),
//     };

    

//     request(options, async (error, response) => {
//         if (error) throw new Error(error);

//         const responseBody = JSON.parse(response.body);

//         if (responseBody.status === 'success') {
//             return res.status(200).json({
//               message: responseBody.message,
//               data: responseBody.data
//             });
//           } else {
//             return res.status(400).json({
//               message: responseBody.message,
//               data: responseBody.data
//             });
//           }
//     });
// }