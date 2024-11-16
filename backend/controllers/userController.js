const sendEmail = require("../config/sendEmail");
const userModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const veryfyEmailTemp = require("../utils/verifyEmailTemp");
const forgotPasswordTemplate = require("../utils/forgotPasswordTemplate");
const generateAccessToken = require("../utils/generatedAccessToken");
const generateRefreshToken = require("../utils/generateRefreshToken");
const uploadImageClodinary = require("../utils/uploadImageCloudinary");
const generateOtp = require("../utils/generateOTP");

// register controller

exports.signUpUserController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide Name, Email, and Password.",
        error: true,
        success: false,
      });
    }

    // Check if user already exists
    const user = await userModel.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User with this email already exists.",
        error: true,
        success: false,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const payload = {
      name,
      email,
      password: hashPassword,
    };

    const newUser = await userModel.create(payload);
    const save = await newUser.save();

    // Verify email template creation for debugging
    const verifyEmailUrl = `${process.env.FRONTEND_URL}/verifyemail?code=${save?._id}`;
    const verifyEmailContent = veryfyEmailTemp({
      name,
      url: verifyEmailUrl,
    });

    // Send verification email
    const veryfyEmail = await sendEmail({
      sendTo: email,
      subject: "Verify Email From BlinkIT",
      html: verifyEmailContent,
    });

    if (!veryfyEmail) {
      return res.status(500).json({
        message: "Failed to send verification email.",
        error: true,
        success: false,
      });
    }

    return res.status(201).json({
      message: "User Sign Up Successfully",
      error: false,
      success: true,
      data: save,
    });
  } catch (error) {
    console.error("Sign up error:", error);
    return res.status(500).json({
      message: "An error occurred during sign-up. Please try again.",
      error: true,
      success: false,
    });
  }
};
// Email Verify controller
exports.verifyEmailController = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await userModel.findById({ _id: code });
    if (!user) {
      return res.status(404).json({
        message: "Code Not Found.",
        error: true,
        success: false,
      });
    }

    const updateUser = await userModel.updateOne(
      { _id: code },
      {
        verify_email: true,
      }
    );
    return res.status(200).json({
      message: "Verification Done",
      error: true,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: true,
    });
  }
};

// login controller
exports.loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide Email, and Password.",
        error: true,
        success: false,
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User Not Registered",
        error: true,
        success: false,
      });
    }

    if (user.status !== "Active") {
      return res.status(400).json({
        message: "Contact Support",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({
        message: "Invalid Credentials.",
        error: true,
        success: false,
      });
    }

    const accessToken = await generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    const cookieOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set secure cookies only in production
      sameSite: "none",
    };
    res.cookie("accessToken", accessToken, cookieOption);
    res.cookie("refreshToken", refreshToken, cookieOption);

    return res.json({
      message: "Login Successfully.",
      error: false,
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// logout controller

exports.logoutUserController = async (req, res) => {
  try {
    const userId = req.userId;
    const cookieOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set secure cookies only in production
      sameSite: "none",
    };
    res.clearCookie("accessToken", cookieOption);
    res.clearCookie("refreshToken", cookieOption);

    const removeRefreshToken = await userModel.findByIdAndUpdate(userId, {
      refresh_token: "",
    });

    return res.json({
      message: "Logout Successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// upload user Profile Image

exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.userId; // Assumed set by auth middleware
    const image = req.file; // Set by multer middleware

    if (!image) {
      return res.status(400).json({
        message: "No image provided",
        success: false,
        error: true,
      });
    }

    const upload = await uploadImageClodinary(image);

    if (!upload || !upload.url) {
      throw new Error("Image upload failed");
    }

    const updateUser = await userModel.findByIdAndUpdate(
      userId,
      { avatar: upload.url },
      { new: true } // Returns the updated document
    );

    return res.json({
      message: "Profile uploaded successfully",
      success: true,
      error: false,
      data: {
        _id: updateUser._id,
        avatar: upload.url,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server error",
      error: true,
      success: false,
    });
  }
};

// update user profile details

exports.updateUserDetails = async (req, res) => {
  try {
    const userId = req.userId; // Assumed set by auth middleware
    const { name, email, mobile, password } = req.body;

    let hashPassword = "";

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
    }

    const updateUser = await userModel.updateOne(
      { _id: userId },
      {
        ...(name && { name: name }),
        ...(email && { email: email }),
        ...(mobile && { mobile: mobile }),
        ...(password && { password: hashPassword }),
      }
    );

    return res.json({
      message: "Profile updated successfully.",
      success: true,
      error: false,
      data: updateUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server error",
      error: true,
      success: false,
    });
  }
};

// forgot password

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Email Not Registered",
        error: true,
        success: false,
      });
    }

    // Generate a unique otp for password reset
    const otp = generateOtp();
    const expireTime = new Date() + 60 * 60 * 1000; // 1 hour from now
    const update = await userModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: otp,
      forgot_password_expiry: new Date(expireTime).toISOString(),
    });

    await sendEmail({
      sendTo: email,
      subject: "Forgot Password OTP",
      html: forgotPasswordTemplate({
        name: user.name,
        otp: otp,
      }),
    });

    return res.json({
      message: "OTP sent to your email.",
      error: false,
      success: true,
    });
    // forgot_password_otp
    // forgot_password_expiry
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server error",
      error: true,
      success: false,
    });
  }
};

exports.verifyForgotPasswordOpt = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Please provide email and otp.",
        error: true,
        success: false,
      });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Email Not Registered",
        error: true,
        success: false,
      });
    }
    const currentTime = new Date(); // current time

    if (user.forgot_password_expiry < currentTime) {
      return res.status(400).json({
        message: "OTP Not Expired",
        error: true,
        success: false,
      });
    }

    if (opt !== user.forgot_password_otp) {
      return res.status(400).json({
        message: "Invaild OTP",
        error: true,
        success: false,
      });
    }

    //  update otp and expiry time not expire
    return res.json({
      message: "OTP Verified.",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server error",
      error: true,
      success: false,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // Check if email, newPassword, and confirmPassword are provided
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Please provide email, newPassword, and confirmPassword",
        error: true,
        success: false,
      });
    }

    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Email not registered",
        error: true,
        success: false,
      });
    }

    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
        error: true,
        success: false,
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    const update = await userModel.findByIdAndUpdate(user._id, {
      password: hashPassword,
    });

    // Check if update was successful
    if (!update) {
      return res.status(500).json({
        message: "Error updating password",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "Password updated successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while resetting password",
      error: true,
      success: false,
    });
  }
};
