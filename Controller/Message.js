const Message = require("../MODEL/Messages");
const Conversation = require("../MODEL/Conversation");

const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    if (!sender || !receiver || !message) {
      return res.status(400).json({
        success: false,
        message: "Sender, receiver and message are required",
      });
    }

    let conversation = await Conversation.findOne({
      members: { $all: [sender, receiver] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [sender, receiver],
        lastMessage: message,
        lastMessageTime: Date.now(),
      });
    } else {
      conversation.lastMessage = message;
      conversation.lastMessageTime = Date.now();
      await conversation.save();
    }

    const newMessage = await Message.create({
      conversationId: conversation._id,
      sender,
      receiver,
      message,
      status: "sent",
      timestamp: Date.now(),
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message,
    });
  }
};

const markDelivered = async (req, res) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.messageId,
      { status: "delivered" },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message marked as delivered",
      data: updatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update message status",
      error: error.message,
    });
  }
};

const markSeen = async (req, res) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.messageId,
      { status: "seen" },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message marked as seen",
      data: updatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update message status",
      error: error.message,
    });
  }
};

const getMessagesByConversationId = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

const getMessagesBetweenUsers = async (req, res) => {
  try {
    const { sender, receiver } = req.params;

    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  markDelivered,
  markSeen,
  getMessagesByConversationId,
  getMessagesBetweenUsers,
};