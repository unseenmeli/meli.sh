document.addEventListener("DOMContentLoaded", () => {
  const projects = [
    { project: "geoarsh", description: "p-for-geo" },
    { project: "weboneshot", description: "p-for-weboneshot" },
    { project: "oneshot", description: "p-for-oneshot" },
    { project: "fuzzy", description: "p-for-fuzzy" },
  ];

  // Add event listeners for each project
  projects.forEach(({ project, description }) => {
    const projectElement = document.getElementById(project);
    const descriptionElement = document.getElementById(description);

    projectElement.addEventListener("mouseenter", () => {
      descriptionElement.style.opacity = "1";
    });

    projectElement.addEventListener("mouseleave", () => {
      descriptionElement.style.opacity = "0";
    });
  });
});

const readerElement = document.getElementById("reader-count");
let ws = null;
let reconnectTimeout = null;

// WebSocket URL - update this after deploying to Render
const WS_URL = "https://meli-sh.onrender.com"; // UPDATE THIS with your actual Render URL

function connectWebSocket() {
  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("Connected to visitor counter");
      sendStatus();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "count" && readerElement) {
        readerElement.textContent = data.count;
        console.log(`Active readers: ${data.count}`);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from counter");
      reconnectTimeout = setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  } catch (error) {
    console.error("Failed to connect:", error);
    if (readerElement) readerElement.textContent = "1";
  }
}

function sendStatus() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    const status = document.visibilityState === "visible" ? 1 : 0;
    ws.send(JSON.stringify({ type: "status", status }));
  }
}

document.addEventListener("visibilitychange", () => {
  sendStatus();
});

if (readerElement) {
  connectWebSocket();
}
