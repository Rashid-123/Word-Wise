const { Schema, model } = require("mongoose");

const reportSchema = new Schema({
  reportBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
});

const adminSchema = new Schema({
  featured: { type: Schema.Types.ObjectId, ref: "Post" },
  reports: [reportSchema], // Use the nested schema for reports
});

module.exports = model("Admin", adminSchema);
