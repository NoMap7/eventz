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
