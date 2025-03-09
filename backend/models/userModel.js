const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String },
  posts: { type: Number, default: 0 },
  likes: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  bookmarks: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  reports: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  following: [{ type: Schema.Types.ObjectId, ref: "User" }],
  followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

module.exports = model("User", userSchema);
