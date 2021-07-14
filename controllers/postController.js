const Post = require('./../models/postModel');
const apiFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');

exports.getAllPosts = async (req, res, next) => {
  try {
    // const posts = await Post.find({});
    const features = new apiFeatures(Post.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const posts = await features.query;

    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: {
        posts,
      },
    });
  } catch (err) {
    // res.status(500).json({
    //   status: 'fail',
    //   message: err,
    // });
    next(err);
  }
};

exports.createPosts = async (req, res, next) => {
  try {
    const newPost = await Post.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        newPost,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post == null) {
      return next(new AppError('The post was not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        post,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePosts = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });
    if (post == null) {
      return next(new AppError('The post was not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        post,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deletePosts = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (post == null) {
      return next(new AppError('The post was not found', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
