const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const complainSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    wasteType: {
      type: [String],
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    locationDescription: {
      type: String,
      required: true,
    },
    file: {
      type: String,
    },
    date: {
      type: String,
      // default: Date.now,
    },
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complain", complainSchema);
