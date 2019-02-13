const express = require("express");
const app = express();
const socket = require("socket.io");
const db = require("./models");
const chance = require("chance").Chance();
const port = 3000 || process.env.port;

// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/index.html");
// });

const server = app.listen(port, () => {
  console.log("listening on port " + port);
});

const io = socket(server);

// io.on("connection", function(socket) {
//   socket.on("chat message", function(msg) {
//     console.log("message: " + msg);
//   });
// });

io.on("connection", socket => {
  socket.on("need Id", msg => {
    createUser(socket, "need Id");
  });

  socket.on("have Id", msg => {
    findUser(socket, msg);
  });

  socket.on("chat message", msg => {
    createMessage(socket, msg);
    // socket.broadcast.emit("chat message", msg);
  });

  socket.on("typing", msg => {
    socket.broadcast.emit("typing", msg);
  });
});

const sendOldMessages = socket => {
  db.Message.find()
    .sort({ created_at: -1 })
    .populate("owner_id")
    .then(foundmessages => {
      if (foundmessages) {
        const messages = foundmessages.map(message => ({
          key: message._id,
          user: message.owner_id.name,
          msg: message.msg
        }));
        socket.emit("chat message", messages);
      }
    })
    .catch(err => {
      console.log(err);
    });
};

const createUser = (socket, channel) => {
  db.User.create({
    name: chance.first()
  })
    .then(function(newUser) {
      socket.emit(channel, newUser);
    })
    .catch(function(err) {
      console.log(err);
    });
};

const findUser = (socket, id) => {
  db.User.findById(id)
    .then(foundUser => {
      if (foundUser) {
        socket.emit("have Id", foundUser);
        sendOldMessages(socket);
      } else {
        createUser(socket, "invalid Id");
      }
    })
    .catch(function(err) {
      console.log(err);
    });
};

const createMessage = (socket, msg) => {
  db.Message.create({
    msg: msg.msg,
    owner_id: msg.userId
  })
    .then(newMessage => {
      socket.emit("chat message", [
        {
          key: newMessage._id,
          user: msg.userName,
          msg: msg.msg
        }
      ]);
    })
    .catch(function(err) {
      console.log(err);
    });
};
