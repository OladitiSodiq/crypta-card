// /controllers/userController.js
const User = require('../models/userModel');
const request = require('request');
const AES256 = require('aes-everywhere'); 
require('dotenv').config();

exports.registerUser = async (req, res) => {
  try {
    const { user_id } = req.body;

    // Find the user by user_id in MongoDB
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare the body for the API request
    const requestBody = {
      first_name: user.first_name,
      last_name: user.last_name,
      address: {
        address: user.address.address,
        city: user.address.city,
        state: user.address.state,
        country: user.address.country,
        postal_code: user.address.postal_code,
        house_no: user.address.house_no
      },
      phone: user.phone,
      email_address: user.email_address,
      identity: {
        id_type: user.identity.id_type,
        bvn: user.identity.bvn,
        selfie_image: user.identity.selfie_image
      },
      meta_data: { any_key: "any_value" }
    };

    // Make the API request
    const options = {
      method: 'POST',
      url: `${process.env.card_holder_reg}`,
      headers: {
        'token': process.env.API_TOKEN
      },
      body: JSON.stringify(requestBody)
    };

    request(options, async (error, response) => {
      if (error) throw new Error(error);
      const responseData = JSON.parse(response.body);

      if (response.statusCode === 201) {
        // Successfully created cardholder, save cardholder_id in the user record
        user.cardholder_id = responseData.data.cardholder_id;
        await user.save();

        return res.status(201).json({
          message: 'Cardholder created successfully.',
          cardholder_id: responseData.data.cardholder_id
        });
      } else {
        return res.status(response.statusCode).json({
          message: responseData.message || 'Failed to create cardholder'
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

 
exports.getCardholderDetails = (req, res) => {
    const { cardholder_id } = req.params;
  
    const options = {
      method: 'GET',
      url: `${process.env.get_card_holder_API_URL}?cardholder_id=${cardholder_id}`,
      headers: {
        'token': process.env.API_TOKEN
      }
    };
  
    request(options, function (error, response) {
      if (error) {
        return res.status(500).json({ error: 'Error fetching cardholder details' });
      }
      
      const body = JSON.parse(response.body);
      
      if (body.status === 'success') {
        return res.status(200).json(body.data);
      } else {
        return res.status(400).json({ message: body.message });
      }
    });
  };


  exports.fundWallet = (req, res) => {
    const { amount } = req.body;
  
    // Validate the amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
  
    const options = {
      'method': 'PATCH',
      'url': `${process.env.fund_walet_url}`, 
      'headers': {
        'token': `${process.env.API_TOKEN}`, 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "amount": amount
      })
    };
  
    // Sending the request to the Bridgecard API
    request(options, function (error, response) {
      if (error) {
        return res.status(500).json({ message: 'Error funding wallet', error: error.message });
      }
  
      const responseBody = JSON.parse(response.body);
  
      // Check if the request was successful
      if (responseBody.status === 'success') {
        return res.status(200).json({ message: responseBody.message, data: responseBody.data });
      } else {
        return res.status(400).json({ message: responseBody.message });
      }
    });
  };


 