const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  msg: {
    type: String
  },

  created_at: {
    type: Date,
    default: Date.now
  },

  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
