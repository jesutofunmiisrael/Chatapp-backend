const User = require("../MODEL/UserModel");
const Conversation = require("../MODEL/Conversation");

const getOrCreateConversation = async (req, res) => {
  try {
    const { sender, receiver } = req.body;

    if (!sender || !receiver) {
      return res.status(400).json({
        success: false,
        message: "Sender and receiver are required",
      });
    }

    let conversation = await Conversation.findOne({
      members: { $all: [sender, receiver] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [sender, receiver],
        lastMessage: "",
        lastMessageTime: Date.now(),
      });
    }

    const otherMember = conversation.members.find(
      (member) => member !== sender
    );

    const userDetails = await User.findOne({ phoneNumber: otherMember });

    res.status(200).json({
      success: true,
      message: "Conversation ready",
      data: {
        _id: conversation._id,
        members: conversation.members,
        lastMessage: conversation.lastMessage,
        lastMessageTime: conversation.lastMessageTime,
        chatUser: userDetails
          ? {
              phoneNumber: userDetails.phoneNumber,
              name: userDetails.name,
              profilePic: userDetails.profilePic,
              lastSeen: userDetails.lastSeen,
            }
          : {
              phoneNumber: otherMember,
              name: "Unknown User",
              profilePic: "",
              lastSeen: "offline",
            },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get or create conversation",
      error: error.message,
    });
  }
};

const getUserConversations = async (req, res) => {
  try {
    const myPhoneNumber = req.params.phoneNumber;

    const conversations = await Conversation.find({
      members: { $in: [myPhoneNumber] },
    }).sort({ updatedAt: -1 });

    const formattedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const otherMember = conversation.members.find(
          (member) => member !== myPhoneNumber
        );

        const userDetails = await User.findOne({ phoneNumber: otherMember });

        return {
          _id: conversation._id,
          members: conversation.members,
          lastMessage: conversation.lastMessage,
          lastMessageTime: conversation.lastMessageTime,
          chatUser: userDetails
            ? {
                phoneNumber: userDetails.phoneNumber,
                name: userDetails.name,
                profilePic: userDetails.profilePic,
                lastSeen: userDetails.lastSeen,
              }
            : {
                phoneNumber: otherMember,
                name: "Unknown User",
                profilePic: "",
                lastSeen: "offline",
              },
        };
      })
    );

    res.status(200).json({
      success: true,
      data: formattedConversations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

module.exports = {
  getOrCreateConversation,
  getUserConversations,
};