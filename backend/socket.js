import User from "./models/user.model.js";

const socketHandler = (io) => {
  io.on("connection", async (socket) => {
    console.log("New client connected:", socket.id);

    const { userId } = socket.handshake.query;

    // 🔐 Guard
    if (!userId) {
      console.log("No userId provided in socket handshake");
      return;
    }

    try {
      // ✅ update socketId + online status
      await User.findByIdAndUpdate(
        userId,
        {
          socketId: socket.id,
          isOnline: true,
        },
        { new: true }
      );

      console.log(`User ${userId} is online`);
    } catch (err) {
      console.log("Socket connect error:", err.message);
    }

    socket.on("disconnect", async () => {
      console.log("Client disconnected:", socket.id);

      try {
        await User.findByIdAndUpdate(
          userId,
          {
            socketId: null,
            isOnline: false,
          },
          { new: true }
        );

        console.log(`User ${userId} is offline`);
      } catch (err) {
        console.log("Socket disconnect error:", err.message);
      }
    });
  });
};

export default socketHandler;
