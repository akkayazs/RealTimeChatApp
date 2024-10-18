const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs-react");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

// Room Schema
const roomSchema = new mongoose.Schema({
  name: String,
  users: [String],
});
const Room = mongoose.model("Room", roomSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  room: String,
  user: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

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

  socket.on("sendMessage", async (messageData) => {
    console.log("Message received:", messageData);

    const { roomName, userName, message } = messageData;

    const newMsg = new Message({
      room: roomName,
      user: userName,
      message: message,
    });
    await newMsg.save();

    io.to(roomName).emit("receiveMessage", {
      user: userName,
      message,
      timestamp: new Date(),
    });
  });

  socket.on("joinRoom", (roomName) => {
    socket.join(roomName);
  });

  socket.on("typing", (data) => {
    socket.to(data.room).emit("typing", { user: data.user });
  });

  socket.on("stopTyping", (data) => {
    socket.to(data.room).emit("stopTyping");
  });
});

// Signing in a user
app.post("/sign-in", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ success: true, token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Signing up a user
app.post("/sign-up", async (req, res) => {
  const { username, hashedPassword } = req.body;

  try {
    const newUser = new User({
      username: username,
      password: hashedPassword,
    });
    await newUser.save();

    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Check if username exists
app.get("/check-username/:username", async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });

  if (user) {
    return res.json({ exists: true });
  }
  return res.json({ exists: false });
});

// Get all room names and user counts, sorted by user count
app.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find({}, "name users");
    const roomData = rooms
      .map((room) => ({ name: room.name, userCount: room.users.length }))
      .sort((a, b) => b.userCount - a.userCount);

    res.json({ success: true, rooms: roomData });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Joining a room
app.post("/join-room", async (req, res) => {
  const { room, storedUsername } = req.body;

  try {
    let existingRoom = await Room.findOne({ name: room });

    if (existingRoom) {
      if (!existingRoom.users.includes(storedUsername)) {
        existingRoom.users.push(storedUsername);
        await existingRoom.save();
      }
    } else {
      const newRoom = new Room({
        name: room,
        users: [storedUsername],
      });
      await newRoom.save();
    }
    res.json({ success: true, roomName: room });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Sending a message on a room
// app.post("/send-message", async (req, res) => {
//   const { roomName, userName, message } = req.body;
//   try {
//     const newMsg = new Message({
//       room: roomName,
//       user: userName,
//       message: message,
//     });
//     await newMsg.save();
//     res.json({ success: true });
//   } catch (error) {
//     console.error("Error sending message:", error);
//     res.status(500).json({ success: false, message: "Internal server error." });
//   }
// });

// Loading previous messages on a room
app.get("/messages/:room", async (req, res) => {
  const { room } = req.params;

  try {
    const messages = await Message.find({ room }).sort({ timestamp: 1 });
    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
