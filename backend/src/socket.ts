import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { query } from "./db/pool";

export function setupSocket(io: Server) {
  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Auth required"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      (socket as any).userId = decoded.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId as string;
    socket.join(`user:${userId}`);
    console.log(`🔌 User connected: ${userId}`);

    // Join conversation room
    socket.on("join:conversation", (conversationId: string) => {
      socket.join(`conv:${conversationId}`);
    });

    // Send message
    socket.on("message:send", async (data: { conversationId: string; text: string }) => {
      try {
        const res = await query(
          `INSERT INTO messages (conversation_id, sender_id, text)
           VALUES ($1, $2, $3) RETURNING *`,
          [data.conversationId, userId, data.text]
        );
        const msg = res.rows[0];

        // Update conversation
        await query(
          `UPDATE conversations SET last_message_at = NOW(), updated_at = NOW() WHERE id = $1`,
          [data.conversationId]
        );

        // Increment unread for other participant
        await query(
          `UPDATE conversation_participants SET unread_count = unread_count + 1
           WHERE conversation_id = $1 AND user_id != $2`,
          [data.conversationId, userId]
        );

        io.to(`conv:${data.conversationId}`).emit("message:new", msg);
      } catch (err) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Mark read
    socket.on("message:read", async (data: { conversationId: string }) => {
      await query(
        `UPDATE conversation_participants SET unread_count = 0, updated_at = NOW()
         WHERE conversation_id = $1 AND user_id = $2`,
        [data.conversationId, userId]
      );
      await query(
        `UPDATE messages SET receipt = 'read', read_at = NOW()
         WHERE conversation_id = $1 AND sender_id != $2 AND receipt != 'read'`,
        [data.conversationId, userId]
      );
    });

    // Typing
    socket.on("typing:start", (conversationId: string) => {
      socket.to(`conv:${conversationId}`).emit("typing:start", { userId });
    });
    socket.on("typing:stop", (conversationId: string) => {
      socket.to(`conv:${conversationId}`).emit("typing:stop", { userId });
    });

    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${userId}`);
    });
  });
}
