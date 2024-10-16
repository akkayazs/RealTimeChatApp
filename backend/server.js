const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

const roomSchema = new mongoose.Schema({
  name: String,
  users: [String],
});
const Room = mongoose.model("Room", roomSchema);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New user connected");
  socket.on("sendMessage", (message) => {
    io.emit("receiveMessage", message);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.post("/join-room", async (req, res) => {
  const { room, name } = req.body;

  try {
    let existingRoom = await Room.findOne({ name: room });

    if (existingRoom) {
      if (!existingRoom.users.includes(name)) {
        existingRoom.users.push(name);
        await existingRoom.save();
      }
    } else {
      const newRoom = new Room({
        name: room,
        users: [name],
      });
      await newRoom.save();
    }

    res.json({ success: true, roomName: room });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});
