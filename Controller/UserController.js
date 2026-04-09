const User = require("../MODEL/UserModel");

const registerUser = async (req, res) => {
  try {
    const { phoneNumber, name, profilePic, gender } = req.body;

    let user = await User.findOne({ phoneNumber });

    if (user) {
      return res.status(200).json({
        success: true,
        message: "User already exists",
        data: user,
      });
    }

    user = await User.create({
      phoneNumber,
      name,
      profilePic: profilePic || "",
      gender: gender || "male",
      lastSeen: "offline",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, profilePic, gender } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { phoneNumber: req.params.phoneNumber },
      { name, profilePic, gender },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const query = req.params.query;

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { phoneNumber: { $regex: query, $options: "i" } },
      ],
    }).select("-__v");

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to search users",
      error: error.message,
    });
  }
};

const getUserByPhoneNumber = async (req, res) => {
  try {
    const user = await User.findOne({
      phoneNumber: req.params.phoneNumber,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  updateUser,
  searchUsers,
  getUserByPhoneNumber,
};