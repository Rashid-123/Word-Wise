const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Agriculture",
        "Business",
        "Education",
        "Entertainment",
        "Art",
        "Investment",
        "Weather",
        "Programming",
        "Others",
      ],
      message: "VALUE is not supported",
    },
    description: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    thumbnail: { type: String, required: true },
    total_likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = model("Post", postSchema);
