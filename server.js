const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Track each user's status: Map<connectionId, status (0 or 1)>
const userStatuses = new Map();

// Calculate total active users
function getActiveCount() {
  let count = 0;
  userStatuses.forEach((status) => {
    count += status; // Add 1 if active, 0 if not
  });
  return count;
}

// Broadcast active count to all connected clients
function broadcastCount() {
  const activeCount = getActiveCount();
  const message = JSON.stringify({ type: "count", count: activeCount });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Handle WebSocket connections
wss.on("connection", (ws) => {
  const connectionId = Date.now() + Math.random(); // Unique ID for this connection
  userStatuses.set(connectionId, 1); // New user starts as active

  console.log(`User connected: ${connectionId}`);
  broadcastCount();

  // Handle messages from client
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "status") {
        // Update user's status (0 = tab hidden, 1 = tab visible)
        userStatuses.set(connectionId, data.status);
        console.log(`User ${connectionId} status: ${data.status}`);
        broadcastCount();
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  // Handle disconnection
  ws.on("close", () => {
    userStatuses.delete(connectionId);
    console.log(`User disconnected: ${connectionId}`);
    broadcastCount();
  });

  // Handle errors
  ws.on("error", (error) => {
    console.error(`WebSocket error for ${connectionId}:`, error);
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    activeUsers: getActiveCount(),
    totalConnections: userStatuses.size,
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
});
