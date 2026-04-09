const express = require("express");
const router = express.Router();

const {
  registerUser,
  updateUser,
  searchUsers,
  getUserByPhoneNumber,
} = require("../Controller/UserController");

router.post("/register", registerUser);
router.put("/update/:phoneNumber", updateUser);
router.get("/search/:query", searchUsers);
router.get("/:phoneNumber", getUserByPhoneNumber);

module.exports = router;