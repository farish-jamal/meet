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
  const { id } = req.params;

  const user = await User.findById({ _id: id });

  if (!user) {
    throw new ApiError(404, `User not found`);
  }

  const posts = await Post.find({ createdBy: id }).select("-password");

  const updatedPost = { user, posts };

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPost, "Profile fetched successfully"));
});

exports.handleGetExplorePage = asyncHandler(async (req, res) => {
  const posts = await Post.aggregate([
    { $match: { visibility: "public" } },
    { $sample: { size: await Post.countDocuments({ visibility: "public" }) } }
  ]);

  if (posts.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, post, "All public post fetched"));
  }

  const userId = posts.map((item) => item.createdBy);
  const postUser = await User.find({ _id: { $in: userId } });

  const postWithUser = posts.map((post) => {
    const user = postUser.map((u) => {
      if (u._id.toString() === post.createdBy.toString()) {
        return u;
      }
    });
    return {
      ...post.toObject(),
      user,
    };
  });

  return res
    .status(200)
    .json(new ApiResponse(200, postWithUser, "All public post fetched"));
});

exports.handleGetSinglePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById({ _id: id });
  const userId = post.createdBy;
  const user = await User.findById({ _id: userId });

  const postWithUser = { ...post.toObject(), user };

  if (!post) {
    throw new ApiError(404, "No post found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, postWithUser, "Post fetched"));
});

exports.handleAddFriends = asyncHandler(async (req, res) => {
  const { friendId } = req.body;
  const { id } = req.user;

  if (!friendId) throw new ApiError(400, "Friend id missing");
  if (friendId === id) throw new ApiError(400, "User cannot add themselves");

  const friend = await User.findById(friendId);
  const user = await User.findById(id);

  if (!user || !friend) throw new ApiError(404, "User or friend doesnot exist");

  if (user.friendList.includes(friendId))
    throw new ApiError(400, "Already a friend");

  user.friendList.push(friendId);
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Friend added successfully"));
});

exports.handleGetFeed = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");

  const friendList = user.friendList;

  const posts = await Post.find({
    createdBy: { $in: [...friendList, id] },
  }).sort({ createdAt: -1 });
  if (posts.length === 0)
    return res
      .status(200)
      .json(new ApiResponse(200, posts, "All post fetched successfully"));

  const userId = posts.map((item) => item.createdBy.toString());

  const postUser = await User.find({ _id: { $in: userId } }).select(
    "-password"
  );

  const postWithUser = posts.map((post) => {
    const user = postUser.find(
      (u) => u._id.toString() === post.createdBy.toString()
    );
    return {
      ...post.toObject(),
      user: user,
    };
  });

  return res
    .status(200)
    .json(new ApiResponse(200, postWithUser, "All post fetched successfully"));
});

exports.handleGetPeople = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const user = await User.findById(id);
  if (!user) throw new ApiError("404", "No user found");

  const friends = user.friendList;

  const people = await User.find({ _id: { $nin: [...friends, id] } });
  return res
    .status(200)
    .json(new ApiResponse(200, people, "All post fetched successfully"));
});

exports.handleGerAllFriends = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");

  const friends = user.friendList;
  const userFriends = await User.find({ _id: { $in: friends } });
  if (userFriends.length < 0)
    return res
      .status(200)
      .json(new ApiResponse("200", [], "Friends Fetched Sucessfully!"));
  return res
    .status(200)
    .json(new ApiResponse("200", userFriends, "Friends Fetched Sucessfully!"));
});

exports.handleUnfollowUser = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const {friendId} = req.body;

  const user = await User.findById(id);

  const userFriendExists = user.friends.some(friend => friend.toString() === friendId);

  if(!userFriend) throw new ApiError(404, 'No friend found');

  const userUpdate = await User.findByIdAndUpdate(
    id,
    { $pull: { friends: friendId } },
    { new: true }
  );

  if(!userUpdate) throw new ApiError('500', 'Error while removing friend');

  return res.status(201).json(new ApiResponse(201, userUpdate, 'Unfollowed'));
})
