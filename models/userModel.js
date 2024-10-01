// /models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  address: {
    address: String,
    city: String,
    state: String,
    country: String,
    postal_code: String,
    house_no: String
  },
  phone: { type: String, required: true },
  email_address: { type: String, required: true },
  identity: {
    id_type: String,
    bvn: { type: String, required: true },
    selfie_image: String
  },
  cardholder_id: { type: String }, // Store cardholder ID from response
  card_id: { type: String }, // Store card ID from card creation response
});


// available_balance 
module.exports = mongoose.model('User', userSchema);
