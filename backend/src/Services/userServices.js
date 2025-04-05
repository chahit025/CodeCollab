import User from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendOtpEmail } from "./emailService.js";

export const createUser = async ({ email, password, username }) => {
  if (!email || !password || !username) {
    return { error: "username, Email and password are required" };
  }
  
  // Instead of creating the user directly, we'll store the data temporarily
  // and generate an OTP for verification
  const hashedPassword = await hashPassword(password);
  
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  // Create a temporary user with OTP
  const tempUser = await User.create({
    username,
    email,
    password: hashedPassword,
    otp,
    otpExpiry,
    isVerified: false,
    tempData: { username, email, password: hashedPassword }
  });
  
  // Send OTP email
  await sendOtpEmail(email, otp);
  
  return tempUser;
};

export const verifyOtp = async (email, otp) => {
  try {
    // Find user with matching email and unexpired OTP
    const user = await User.findOne({
      email,
      otp,
      otpExpiry: { $gt: Date.now() }
    }).select('+otp +otpExpiry +tempData');
    
    if (!user) {
      return { success: false, message: "Invalid or expired OTP" };
    }
    
    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.tempData = undefined;
    
    await user.save();
    
    return { success: true, user };
  } catch (error) {
    console.error('OTP verification error:', error);
    return { success: false, message: error.message };
  }
};

export const resendOtp = async (email) => {
  try {
    const user = await User.findOne({ email, isVerified: false })
      .select('+otp +otpExpiry');
    
    if (!user) {
      return { success: false, message: "User not found or already verified" };
    }
    
    // Generate a new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    
    // Send new OTP email
    await sendOtpEmail(email, otp);
    
    return { success: true };
  } catch (error) {
    console.error('Resend OTP error:', error);
    return { success: false, message: error.message };
  }
};

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const findOne = async (query) => {
  return await User.findOne(query).select('+password');
};

export const isValidPassword = async (password, userPassword) => {
  return await bcrypt.compare(password, userPassword);
};

export const generateResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { error: "No user found with this email address" };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(resetToken, 10);

  user.resetToken = hashedToken;
  user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
  await user.save();

  return { success: true, resetToken, user };
};

export const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetToken: { $exists: true },
    resetTokenExpiry: { $gt: Date.now() }
  }).select('+resetToken +resetTokenExpiry');

  if (!user) {
    return { error: "Invalid or expired reset token" };
  }

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  return { success: true };
};