import mongoose from "mongoose";

export const User = mongoose.model("User", new mongoose.Schema({
  email: String,
  password: String
}));

export const Mail = mongoose.model("Mail", new mongoose.Schema({
  from: String,
  to: String,
  subject: String,
  body: String,
  time: { type: Date, default: Date.now }
}));
