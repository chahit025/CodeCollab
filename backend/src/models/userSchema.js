import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, 
    trim: true,
    lowercase: true,
    minLength: [3, "Email must be at least 3 characters long"],
    maxLength: [55, "Email must not be more than 55 characters long"],
    validate: {
      validator: (v) => /^\S+@\S+\.\S+$/.test(v),
      message: "Email must be a valid email address"
    }
  },
  password: {
    type: String,
    required: true,
    select: false,
    minLength: [3, "Password must be at least 3 characters long"], 
  },
  resetToken: {
    type: String,
    select: false,
  },
  resetTokenExpiry: {
    type: Date,
    select: false,
  },
  otp: {
    type: String,
    select: false,
  },
  otpExpiry: {
    type: Date,
    select: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  tempData: {
    type: Object,
    select: false,
  }
});

userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateJWT = function () {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not defined in environment variables!");
    throw new Error("JWT configuration error");
  }
  
  return jwt.sign(
    { 
      email: this.email,
      username: this.username,
      _id: this._id 
    }, 
    secret, 
    { expiresIn: "1h" }
  );
};

const User = mongoose.model("User", userSchema);

export default User; // Default export
