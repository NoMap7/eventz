const Post = require('./../models/postModel');

exports.getHome = async (req, res, next) => {
  try {
    const posts = await Post.find({});

    res.status(200).render('home', {
      title: 'All Posts',
      posts,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const event = await Post.findById({ slug: req.params.slug });

    res.status(200).render('event', {
      title: 'Event',
      event,
    });
  } catch (err) {
    next(err);
  }
};

exports.getLoginForm = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};
