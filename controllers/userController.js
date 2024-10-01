// /controllers/userController.js
const User = require('../models/userModel');
const request = require('request');

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
      url: 'https://issuecards.api.bridgecard.co/v1/issuing/sandbox/cardholder/register_cardholder_synchronously',
      headers: {
        'token': 'Bearer at_test_25148e15011c888a9b7b81957b21b72f86bedc9ae66983b658089eecb1984254bf88d4811e180a6f89e55dd6ff74fb75201bf1cade6f2136bedb949f17eccf52f3853c1c48a394b02f613c44754e1468f860441e25387717f968728443faf190ad86886663e847e979067588c774618502000e431c79f17763b1f2e19bfd4624a0b15ee34c223d687be10a03903478e175f87d2b72810436463f43d7a5c015aae60a0b214a1ba1066166150d67a00ff05dcf49596bcb4083c0d4274e6dd72933f9dfa533d67bbf3a305eacaaa6ba7af2ae730e507e6c7e742010836bd8992bbd937821dbc7390678929a01a38bd77733af52483f705234ffb5ab41c45e9c23c2',
        'Content-Type': 'application/json'
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
