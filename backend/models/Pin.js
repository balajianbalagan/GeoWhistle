const mongoose = require("mongoose");

const PinSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
    },
    title: {
      type: String,
      require: true,
      min: 3,
    },
    desc: {
      type: String,
      require: true,
      min: 3,
    },
    priority: {
      type: Number,
      require: true,
      min: 0,
      max: 5,
    },
    lat: {
      type: Number,
      require: true,
    },
    long: {
      type: Number,
      require: true,
    },
    
    image : String,
    likes : [{
      type : mongoose.ObjectId,
      ref : "User",
      require: false
    }]
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pin", PinSchema);
