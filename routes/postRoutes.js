const express = require('express');
const router = express.Router();
const postController = require('./../controllers/postController');
const authController = require('./../controllers/authController');

router
  .route('/')
  .get(authController.protect, postController.getAllPosts)
  .post(
    authController.protect,
    authController.restrictTo('organiser', 'admin'),
    postController.createPosts
  );

router
  .route('/:id')
  .get(postController.getPost)
  .patch(
    authController.protect,
    authController.restrictTo('organiser', 'admin'),
    postController.updatePosts
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'organiser'),
    postController.deletePosts
  );

module.exports = router;
