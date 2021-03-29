const Posts = require("../models/postModel");

const postCtrl = {
  createPost: async (req, res) => {
    try {
      const { content, images } = req.body;

      if (images.length === 0) {
        return res.status(400).json({ msg: "Please add your photo." });
      }

      const newPost = new Posts({
        content,
        images,
        user: req.user._id,
      });

      await newPost.save();
      return res.json({ msg: "Create Post!", newPost });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getPosts: async (req, res) => {
    try {
      const posts = await Posts.find({
        user: [...req.user.following, req.user._id],
      })
        .sort("-createAt")
        .populate("user likes", "avatar username fullName")
        .populate({
          path: "comments",
          populate: { path: "user likes", select: "-password" },
        });

      res.json({ msg: "Success!", result: posts.length, posts });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  updatePost: async (req, res) => {
    try {
      const { content, images } = req.body;

      const post = await Posts.findOneAndUpdate(
        { _id: req.params.id },
        {
          content,
          images,
        }
      )
        .populate("user likes", "avatar username fullName")
        .populate({
          path: "comments",
          populate: { path: "user likes", select: "-password" },
        });

      res.json({
        msg: "Updated Post!",
        newPost: {
          ...post._doc,
          content,
          images,
        },
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  likePost: async (req, res) => {
    try {
      const post = await Posts.find({
        _id: req.params.id,
        likes: req.user._id,
      });
      if (post.length > 0) {
        return res.status(400).json({ msg: "You liked this post." });
      }

      await Posts.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { likes: req.user._id } },
        { new: true }
      );

      res.json({ msg: "Liked Post!" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  unLikePost: async (req, res) => {
    try {
      await Posts.findOneAndUpdate(
        { _id: req.params.id },
        { $pull: { likes: req.user._id } },
        { new: true }
      );

      res.json({ msg: "UnLiked Post!" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getUserPosts: async (req, res) => {
    try {
      const posts = await Posts.find({ user: req.params.id }).sort("-createAt");
      res.json({ posts, result: posts.length });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Posts.findById(req.params.id)
        .populate("user likes", "avatar username fullName")
        .populate({
          path: "comments",
          populate: { path: "user likes", select: "-password" },
        });
      res.json({ post });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = postCtrl;
