// Wait for both DOM and InstantDB to load
document.addEventListener("DOMContentLoaded", () => {
  // Project hover effects
  const projects = [
    { project: "geoarsh", description: "p-for-geo" },
    { project: "weboneshot", description: "p-for-weboneshot" },
    { project: "oneshot", description: "p-for-oneshot" },
    { project: "fuzzy", description: "p-for-fuzzy" },
  ];

  projects.forEach(({ project, description }) => {
    const projectElement = document.getElementById(project);
    const descriptionElement = document.getElementById(description);

    if (projectElement && descriptionElement) {
      projectElement.addEventListener("mouseenter", () => {
        descriptionElement.style.opacity = "1";
      });

      projectElement.addEventListener("mouseleave", () => {
        descriptionElement.style.opacity = "0";
      });
    }
  });

  // WebSocket for reader count
  const readerElement = document.getElementById("reader-count");
  let ws = null;
  let reconnectTimeout = null;

  const WS_URL = window.location.hostname === "localhost" ? "ws://localhost:3001" : "wss://meli-sh.onrender.com";

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

  // InstantDB Comments System
  if (window.instantdb) {
    const { init, tx, id } = window.instantdb;

    // Initialize InstantDB
    const APP_ID = "422149f2-6c2a-411b-8c09-3d876245d7b6";
    const db = init({ appId: APP_ID });

    // Store comments globally
    let pageComments = [];

    // Helper function to escape HTML
    function escapeHtml(text) {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };
      return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    // Function to display comments
    function displayComments() {
      const container = document.getElementById("comments-container");
      if (!container) return;

      if (pageComments.length === 0) {
        container.innerHTML = '<div class="no-comments">No thoughts shared yet. Be the first!</div>';
      } else {
        container.innerHTML = pageComments
          .map((comment) => {
            // Random anonymous name for each comment
            const names = ["??inaccuracy", "??error", "??failed"];
            const randomName = names[Math.floor(Math.random() * names.length)];

            return `
            <div class="comment-item">
              <div class="comment-name">${randomName}</div>
              <div class="comment-text">${escapeHtml(comment.text)}</div>
            </div>
          `;
          })
          .reverse()
          .join(""); // Show newest first
      }
    }

    // Get page name
    const pathname = window.location.pathname;
    const pageName = pathname.split("/").pop().replace(".html", "") || "index";

    // Subscribe to comments for this page
    db.subscribeQuery(
      {
        comments: {
          $: {
            where: {
              page: pageName,
            },
          },
        },
      },
      (resp) => {
        if (!resp.error && resp.data) {
          pageComments = resp.data.comments || [];
          displayComments();
        }
      }
    );

    // Handle comment input
    const commentInput = document.getElementById("comment-input");
    if (commentInput) {
      commentInput.addEventListener("change", async function () {
        if (commentInput.value.trim()) {
          try {
            // Save to InstantDB
            await db.transact([
              tx.comments[id()].update({
                page: pageName,
                text: commentInput.value.trim(),
              }),
            ]);

            console.log("Comment saved to InstantDB");
            commentInput.value = "";
          } catch (error) {
            console.error("Error saving comment:", error);
          }
        }
      });
    }
  } else {
    console.error("InstantDB not loaded - comments will not work");
  }
});
