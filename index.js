const express = require("express");
const app = express();
const socket = require("socket.io");
const port = 3000 || process.env.port;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const server = app.listen(port, () => {
  console.log("listening on port " + port);
});

const io = socket(server);

// io.on("connection", function(socket) {
//   socket.on("chat message", function(msg) {
//     console.log("message: " + msg);
//   });
// });

io.on("connection", function(socket) {
  socket.on("chat message", function(msg) {
    io.sockets.emit("chat message", msg);
  });
});
