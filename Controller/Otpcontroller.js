const Otp = require("../MODEL/OTP");

const sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.deleteMany({ phoneNumber });

    await Otp.create({
      phoneNumber,
      otp,
      expiresAt,
      verified: false,
    });

    console.log(`OTP for ${phoneNumber}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: {
        phoneNumber,
        otp, 
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    const otpRecord = await Otp.findOne({ phoneNumber }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: "OTP not found. Please request a new one",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (otpRecord.verified) {
      return res.status(400).json({
        success: false,
        message: "OTP already used",
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    await Otp.deleteMany({ phoneNumber });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: {
        phoneNumber,
        verified: true,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
};