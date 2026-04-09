const express = require("express");
const router = express.Router();

const {
  getOrCreateConversation,
  getUserConversations,
} = require("../Controller/Conversation");

router.post("/get-or-create", getOrCreateConversation);
router.get("/:phoneNumber", getUserConversations);

module.exports = router;