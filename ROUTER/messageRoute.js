const express = require("express");
const router = express.Router();

const {
  sendMessage,
  markDelivered,
  markSeen,
  getMessagesByConversationId,
  getMessagesBetweenUsers,
} = require("../Controller/Message");

router.post("/send", sendMessage);
router.put("/delivered/:messageId", markDelivered);
router.put("/seen/:messageId", markSeen);
router.get("/conversation/:conversationId", getMessagesByConversationId);
router.get("/:sender/:receiver", getMessagesBetweenUsers);

module.exports = router;