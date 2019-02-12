const mongoose = require("mongoose");
mongoose.set("debug", false);
mongoose.connect("mongodb://localhost/chat", { useNewUrlParser: true });
mongoose.set("useFindAndModify", false);
mongoose.Promise = Promise;

module.exports.Message = require("./Message");
module.exports.User = require("./user");
