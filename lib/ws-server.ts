// lib/ws-server.ts
import { WebSocketServer } from "ws";

declare global {
  var _wss: WebSocketServer | undefined;
}

let initialized = false;

export function getWSS(): WebSocketServer | undefined {
  if (global._wss) return global._wss;
  if (initialized) return undefined; // prevent multiple initialization attempts
  initialized = true;

  try {
    const wss = new WebSocketServer({ port: 3001 });

    wss.on("connection", (ws) => {
      console.log("🟢 Client connected");

      ws.on("close", () => console.log("🔴 Client disconnected"));
    });

    wss.on("error", (err) => {
      console.error("❌ WebSocket server error:", err);
    });

    global._wss = wss;
    console.log("✅ WebSocket server running on ws://localhost:3001");
    return wss;
  } catch (err) {
    console.error("❌ Failed to start WebSocket server:", err);
    return undefined;
  }
}

// Broadcast helper
export function broadcast(message: any) {
  const wss = getWSS();
  if (!wss) return; // server not running
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(data);
  });
}
