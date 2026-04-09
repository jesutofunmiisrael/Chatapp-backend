// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const connectToDb = require("./config/ConnectToDatabase");

// const Message = require("./MODEL/Messages");
// const Conversation = require("./MODEL/Conversation");
// const User = require("./MODEL/UserModel");

// const messageRoutes = require("./ROUTER/messageRoute");
// const conversationRoutes = require("./ROUTER/conversationroute");
// const userRoutes = require("./ROUTER/UserRoute");
// const authRoutes = require("./ROUTER/Otproute");

// dotenv.config();
// connectToDb();

// const app = express();

// app.use(cors());
// app.use(express.json());

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
// });

// const users = {};

// app.get("/", (req, res) => {
//   res.send("Chat server running 🚀");
// });

// app.use("/api/messages", messageRoutes);
// app.use("/api/conversations", conversationRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/auth", authRoutes);

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("join_chat", async (phoneNumber) => {
//     try {
//       users[phoneNumber] = socket.id;
//       socket.phoneNumber = phoneNumber;

//       let user = await User.findOne({ phoneNumber });

//       if (!user) {
//         user = await User.create({
//           phoneNumber,
//           lastSeen: "online",
//         });
//       } else {
//         user.lastSeen = "online";
//         await user.save();
//       }

//       io.emit("user_status", {
//         phoneNumber,
//         lastSeen: "online",
//       });
//     } catch (error) {
//       console.log("Error in join_chat:", error.message);
//     }
//   });

//   socket.on("send_message", async (data) => {
//     try {
//       const { sender, receiver, message } = data;

//       if (!sender || !receiver || !message) return;

//       let conversation = await Conversation.findOne({
//         members: { $all: [sender, receiver] },
//       });

//       if (!conversation) {
//         conversation = await Conversation.create({
//           members: [sender, receiver],
//           lastMessage: message,
//           lastMessageTime: Date.now(),
//         });
//       } else {
//         conversation.lastMessage = message;
//         conversation.lastMessageTime = Date.now();
//         await conversation.save();
//       }

//       const newMessage = await Message.create({
//         conversationId: conversation._id,
//         sender,
//         receiver,
//         message,
//         status: "sent",
//         timestamp: Date.now(),
//       });

//       const receiverSocket = users[receiver];

//       if (receiverSocket) {
//         io.to(receiverSocket).emit("receive_message", newMessage);

//         await Message.findByIdAndUpdate(newMessage._id, {
//           status: "delivered",
//         });

//         io.to(receiverSocket).emit("message_status_updated", {
//           messageId: newMessage._id,
//           status: "delivered",
//         });

//         socket.emit("message_status_updated", {
//           messageId: newMessage._id,
//           status: "delivered",
//         });
//       }

//       socket.emit("receive_message", {
//         ...newMessage.toObject(),
//         status: receiverSocket ? "delivered" : "sent",
//       });

//       io.emit("conversation_updated", {
//         sender,
//         receiver,
//         lastMessage: message,
//         lastMessageTime: newMessage.timestamp,
//       });
//     } catch (error) {
//       console.log("Error saving message:", error.message);
//     }
//   });

//   socket.on("typing", ({ sender, receiver }) => {
//     const receiverSocket = users[receiver];

//     if (receiverSocket) {
//       io.to(receiverSocket).emit("typing", { sender });
//     }
//   });

//   socket.on("stop_typing", ({ sender, receiver }) => {
//     const receiverSocket = users[receiver];

//     if (receiverSocket) {
//       io.to(receiverSocket).emit("stop_typing", { sender });
//     }
//   });

//   socket.on("message_seen", async ({ messageId, sender }) => {
//     try {
//       await Message.findByIdAndUpdate(messageId, {
//         status: "seen",
//       });

//       const senderSocket = users[sender];

//       if (senderSocket) {
//         io.to(senderSocket).emit("message_status_updated", {
//           messageId,
//           status: "seen",
//         });
//       }
//     } catch (error) {
//       console.log("Error updating seen status:", error.message);
//     }
//   });

//   socket.on("disconnect", async () => {
//     console.log("User disconnected:", socket.id);

//     try {
//       if (socket.phoneNumber) {
//         await User.findOneAndUpdate(
//           { phoneNumber: socket.phoneNumber },
//           {
//             lastSeen: new Date().toLocaleString(),
//           }
//         );

//         io.emit("user_status", {
//           phoneNumber: socket.phoneNumber,
//           lastSeen: new Date().toLocaleString(),
//         });
//       }

//       for (const number in users) {
//         if (users[number] === socket.id) {
//           delete users[number];
//         }
//       }
//     } catch (error) {
//       console.log("Error updating last seen:", error.message);
//     }
//   });
// });

// const PORT = process.env.PORT || 4008;

// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
// baseUrl:http://localhost:4008/




const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectToDb = require("./config/ConnectToDatabase");

const Message = require("./MODEL/Messages");
const Conversation = require("./MODEL/Conversation");
const User = require("./MODEL/UserModel");

const messageRoutes = require("./ROUTER/messageRoute");
const conversationRoutes = require("./ROUTER/conversationroute");
const userRoutes = require("./ROUTER/UserRoute");
const authRoutes = require("./ROUTER/Otproute");

dotenv.config();
connectToDb();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const users = {};

app.get("/", (req, res) => {
  res.send("Chat server running 🚀");
});

app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_chat", async (phoneNumber) => {
    try {
      if (!phoneNumber) return;

      users[phoneNumber] = socket.id;
      socket.phoneNumber = phoneNumber;

      let user = await User.findOne({ phoneNumber });

      if (!user) {
        user = await User.create({
          phoneNumber,
          lastSeen: "online",
        });
      } else {
        user.lastSeen = "online";
        await user.save();
      }

      io.emit("user_status", {
        phoneNumber,
        lastSeen: "online",
      });
    } catch (error) {
      console.log("Error in join_chat:", error.message);
    }
  });

  socket.on("send_message", async (data) => {
    try {
      const { sender, receiver, message } = data;

      if (!sender || !receiver || !message?.trim()) return;

      let conversation = await Conversation.findOne({
        members: { $all: [sender, receiver] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          members: [sender, receiver],
          lastMessage: message,
          lastMessageTime: Date.now(),
        });
      } else {
        conversation.lastMessage = message;
        conversation.lastMessageTime = Date.now();
        await conversation.save();
      }

      const newMessage = await Message.create({
        conversationId: conversation._id,
        sender,
        receiver,
        message,
        status: "sent",
        timestamp: Date.now(),
      });

      const receiverSocket = users[receiver];

      let finalMessage = newMessage.toObject();

      if (receiverSocket) {
        await Message.findByIdAndUpdate(newMessage._id, {
          status: "delivered",
        });

        finalMessage.status = "delivered";

        io.to(receiverSocket).emit("receive_message", finalMessage);

        io.to(receiverSocket).emit("message_status_updated", {
          messageId: finalMessage._id,
          status: "delivered",
        });
      }

      socket.emit("receive_message", finalMessage);

      socket.emit("message_status_updated", {
        messageId: finalMessage._id,
        status: finalMessage.status,
      });

      io.emit("conversation_updated", {
        sender,
        receiver,
        lastMessage: message,
        lastMessageTime: finalMessage.timestamp,
      });
    } catch (error) {
      console.log("Error saving message:", error.message);
    }
  });

  socket.on("typing", ({ sender, receiver }) => {
    try {
      const receiverSocket = users[receiver];

      if (receiverSocket) {
        io.to(receiverSocket).emit("typing", { sender });
      }
    } catch (error) {
      console.log("Typing error:", error.message);
    }
  });

  socket.on("stop_typing", ({ sender, receiver }) => {
    try {
      const receiverSocket = users[receiver];

      if (receiverSocket) {
        io.to(receiverSocket).emit("stop_typing", { sender });
      }
    } catch (error) {
      console.log("Stop typing error:", error.message);
    }
  });

  socket.on("message_seen", async ({ messageId, sender }) => {
    try {
      if (!messageId || !sender) return;

      await Message.findByIdAndUpdate(messageId, {
        status: "seen",
      });

      const senderSocket = users[sender];

      if (senderSocket) {
        io.to(senderSocket).emit("message_status_updated", {
          messageId,
          status: "seen",
        });
      }
    } catch (error) {
      console.log("Error updating seen status:", error.message);
    }
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    try {
      if (socket.phoneNumber) {
        await User.findOneAndUpdate(
          { phoneNumber: socket.phoneNumber },
          {
            lastSeen: new Date().toLocaleString(),
          }
        );

        io.emit("user_status", {
          phoneNumber: socket.phoneNumber,
          lastSeen: new Date().toLocaleString(),
        });
      }

      for (const number in users) {
        if (users[number] === socket.id) {
          delete users[number];
          break;
        }
      }
    } catch (error) {
      console.log("Error updating last seen:", error.message);
    }
  });
});

const PORT = process.env.PORT || 4008;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});