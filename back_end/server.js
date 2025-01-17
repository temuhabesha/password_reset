// importing module starting point
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cors = require ('cors')
require('dotenv').config();
// importing module ending diractory

const app = express();
app.use(bodyParser.json());
app.use(cors())

// Connect to MongoDB
const db_connection = mongoose.connect('mongodb://localhost:27017/usersDB', {});

if(!db_connection){
  console.log('not connected successfully')
}

// User schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  resetToken: String,
  resetTokenExpiration: Date,
});

const User = mongoose.model('User', userSchema);

// Generate and send reset link
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if(!email){
    return res.status(400).send('please enter all fields')
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send('User not found.');

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');

    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();
    // Send email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    console.log(transporter)
    
    const resetLink = `http://localhost:3000/reset-password/${token}`;
    const frompart = await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Password Reset',
      html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });
    
    res.send('Reset link sent to your email.');
  } catch (err) {
    res.status(500).send(err.message);
  }
});



// Reset password
app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() }, // Ensure token hasn't expired
    });

    if (!user) return res.status(400).send('Invalid or expired token.');

    user.password = newPassword; // Hash the password in production
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.send('Password reset successful.');
  } catch (err) {
    res.status(500).send('Error occurred.');
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));