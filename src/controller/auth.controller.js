const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const cloudinary = require("../storage/cloudnary");
const { asyncHandler } = require('../common/asyncHandler');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
require("dotenv").config();

exports.handleRegisterUser = asyncHandler(async(req, res) => {
 const {email, password, name, dob, userName} = req.body;

 const missingField = [];
 if(!email) missingField.push('email');
 if(!password) missingField.push('password');
 if(!dob) missingField.push('dob');
 if(!name) missingField.push('name');
 if(!userName) missingField.push('username');
 if(!req.file) missingField.push('profile');

 if(missingField.length > 0){
  throw new ApiError(400, `Missing required fields: ${missingField.join(',')}`);
 }

 const existingUser = await User.findOne({ $or: [{ email }, { userName }] });

 if (existingUser) {
  let message = '';
  if (existingUser.email === email) {
    message += `${email} is already in use. `;
  }
  if (existingUser.userName === userName) {
    message += `${userName} is already in use.`;
  }
  throw new ApiError(409, message.trim());
}

 let profileUrl = "";
 if (req.file) {
  const profileUrlResponse = await cloudinary.uploader.upload(req.file.path);
  profileUrl = profileUrlResponse.secure_url;
  fs.unlinkSync(req.file.path);
 }

 const hashedPassword = await bcrypt.hashSync(password, salt);
 const user = await User.create({
  email,
  password: hashedPassword,
  name,
  dob,
  userName,
  profile: profileUrl
 });

 if(!user){
  throw new ApiError(500, "User creation failed");
 }

 const { password: _, ...userWithoutPassword } = user.toObject();

 const token = jwt.sign({
  id: user._id, role: 'user'
 }, process.env.JWT_SECRET);

 return res.status(201).json(new ApiResponse(201, { token, user: userWithoutPassword }, 'Account created sucessfully'));
})