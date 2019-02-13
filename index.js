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
    db.User.create({
      name: chance.first()
    })
      .then(function(newUser) {
        io.sockets.emit("need Id", newUser);
      })
      .catch(function(err) {
        console.log(err);
      });
  });

  socket.on("have Id", msg => {
    db.User.findById(msg)
      .then(function(foundUser) {
        foundUser
          ? io.sockets.emit("have Id", foundUser)
          : db.User.create({
              name: chance.first()
            })
              .then(function(newUser) {
                io.sockets.emit("invalid Id", newUser);
              })
              .catch(function(err) {
                console.log(err);
              });
      })
      .catch(function(err) {
        console.log(err);
      });
  });

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
        io.sockets.emit("chat message", messages);
      }
    })
    .catch(err => {
      console.log(err);
    });

  socket.on("chat message", msg => {
    db.Message.create({
      msg: msg.msg,
      owner_id: msg.userId
    })
      .then(function(newMessage) {
        io.sockets.emit("chat message", [
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
    // socket.broadcast.emit("chat message", msg);
  });

  socket.on("typing", msg => {
    socket.broadcast.emit("typing", msg);
  });
});
