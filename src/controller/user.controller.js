const fs = require("fs");
const cloudinary = require("../storage/cloudnary");
const { asyncHandler } = require("../common/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Post = require("../models/post.model");
const User = require("../models/user.model");

exports.handlePostUpload = asyncHandler(async (req, res) => {
  const { caption, visibility } = req.body;
  const { id } = req.user;

  const missingField = [];
  if (!caption) missingField.push("caption");
  if (!req.file) missingField.push("image");

  if (missingField.length > 1) {
    throw new ApiError(
      400,
      `Missing required fields: ${missingField.join(",")}`
    );
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
    createdBy: id,
    visibility,
  });

  if (!data) {
    throw new ApiError(400, `Error in post upload, try again later`);
  }

  return res.status(201).json(new ApiResponse(201, data, "Post uploaded"));
});

exports.handleGetProfile = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const user = await User.findById({ _id: id });

  if (!user) {
    throw new ApiError(404, `User not found`);
  }

  const posts = await Post.find({ createdBy: id });
  if (posts.length === 0) {
    throw new ApiError(404, `No post found`);
  }

  const updatedPost = { user, posts };

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPost, "Profile fetched successfully"));
});

exports.handleGetExplorePage = asyncHandler(async (req, res) => {
  const posts = await Post.find({visibility: 'public'});

  if(posts.length === 0){
    throw new ApiError(404, 'No post found');
  }

  return res.status(200).json(new ApiResponse(200, posts, 'All public post fetched'));
})

exports.handleGetSinglePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById({_id: id});

  if(!post){
    throw new ApiError(404, 'No post found');
  }

  return res.status(200).json(new ApiResponse(200, post, 'Post fetched'));
})
