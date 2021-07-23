const mongoose = require('mongoose');
// const slugify = require('slugify');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'post title cannot be less than 3 characters'],
  },
  slug: String,
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
  performing: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  dates: {
    type: [Date],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'performing',
    select: '-__v -passwordChangedAt -following -email',
  });
  next();
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
