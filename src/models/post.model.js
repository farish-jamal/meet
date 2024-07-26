const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
 caption: {
  type: String,
  required: true,
 },
 image: {
  type: String,
  required: true,
 }
},
{timestamps: true});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;