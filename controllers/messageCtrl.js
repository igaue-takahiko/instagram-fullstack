const Conversations = require("../models/conversationModel");
const Messages = require("../models/messageModel");

class API_features {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 9;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

const messageCtrl = {
  createMessage: async (req, res) => {
    try {
      const { recipient, text, media } = req.body;
      if (!recipient || (!text.trim() && media.length === 0)) {
        return;
      }

      const newConversation = await Conversations.findOneAndUpdate(
        {
          $or: [
            { recipients: [req.user._id, recipient] },
            { recipients: [recipient, req.user._id] },
          ],
        },
        {
          recipients: [req.user._id, recipient],
          text,
          media,
        },
        { new: true, upsert: true }
      );

      const newMessage = new Messages({
        conversation: newConversation,
        sender: req.user._id,
        recipient,
        text,
        media,
      });

      await newMessage.save();
      return res.json({ msg: "Create Success!" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getConversations: async (req, res) => {
    try {
      const features = new API_features(
        Conversations.find({
          recipients: req.user._id,
        }),
        req.query
      ).paginating();

      const conversations = await features.query
        .sort("-updatedAt")
        .populate("recipients", "avatar username fullName");

      return res.json({ conversations, result: conversations.length });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getMessages: async (req, res) => {
    try {
      const features = new API_features(
        Messages.find({
          $or: [
            { sender: req.user._id, recipient: req.params.id },
            { sender: req.params.id, recipient: req.user._id },
          ],
        }),
        req.query
      ).paginating();

      const messages = await features.query.sort("-createdAt");

      return res.json({ messages, result: messages.length });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = messageCtrl;