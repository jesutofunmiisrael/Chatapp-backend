


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      default: "",
    },

    profilePic: {
      type: String,
      default: "",
    },


    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },


    lastSeen: {
      type: String,
      default: "offline",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);