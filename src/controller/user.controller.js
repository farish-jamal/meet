const fs = require('fs');
const cloudinary = require("../storage/cloudnary");
const { asyncHandler } = require('../common/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Post = require('../models/post.model');

exports.handlePostUpload = asyncHandler(async (req, res) => {
 const { caption } = req.body;

 const missingField = [];
 if(!caption) missingField.push('caption');
 if(!req.file) missingField.push('image');

 if(missingField.length > 1){
   throw new ApiError(400, `Missing required fields: ${missingField.join(',')}`);
 }

 let imageUrl = "";
 if (req.file) {
  const imageUrlResponse = await cloudinary.uploader.upload(req.file.path);
  imageUrl = imageUrlResponse.secure_url;
  fs.unlinkSync(req.file.path);
 }

 const data = await Post.create({
  caption,
  image: imageUrl,
 })

 if(!data){
  throw new ApiError(400, `Error in post upload, try again later`);
 }

 return res.status(201).json(new ApiResponse(201, data, 'Post uploaded'));
});