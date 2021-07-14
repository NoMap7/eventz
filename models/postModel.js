const mongoose = require('mongoose');
// const slugify = require('slugify');

const postSchema = new mongoose.Schema({
  //   slug: String,
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'post title cannot be less than 3 characters'],
  },
  likesCount: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: String,
    default: 0,
  },
  coverImage: String,
  description: {
    type: String,
    trim: true,
    required: true,
  },
  venue: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [Number],
    address: String,
  },
  dates: {
    type: [Date],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
