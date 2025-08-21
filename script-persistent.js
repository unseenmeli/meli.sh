// Comments with localStorage persistence and server sync
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

  // Comments System with localStorage and server persistence
  let commentsData = {};
  const STORAGE_KEY = "meli_comments";

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

  // Load comments from localStorage first
  function loadLocalComments() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        commentsData = JSON.parse(stored);
      }
    } catch (e) {
      console.log("Could not load local comments");
    }
  }

  // Save comments to localStorage
  function saveLocalComments() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(commentsData));
    } catch (e) {
      console.log("Could not save to localStorage");
    }
  }

  // Function to display comments
  function displayComments() {
    const container = document.getElementById("comments-container");
    if (!container) return;

    const pathname = window.location.pathname;
    const pageName = pathname.split("/").pop().replace(".html", "") || "index";

    const pageComments = commentsData[pageName] || [];

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

  // Load comments from server
  function loadServerComments() {
    const serverUrl =
      window.location.hostname === "localhost"
        ? "http://localhost:3001/comments.json"
        : "https://meli-sh.onrender.com/comments.json";

    fetch(serverUrl)
      .then((response) => response.json())
      .then((data) => {
        // Merge server data with local data
        Object.keys(data).forEach((page) => {
          if (!commentsData[page]) {
            commentsData[page] = [];
          }
          // Add server comments that aren't already in local
          data[page].forEach((serverComment) => {
            const exists = commentsData[page].some((localComment) => localComment.text === serverComment.text);
            if (!exists) {
              commentsData[page].push(serverComment);
            }
          });
        });
        saveLocalComments();
        displayComments();
      })
      .catch((error) => {
        console.log("Could not load server comments:", error);
        // Still display local comments even if server fails
        displayComments();
      });
  }

  // Initialize comments
  loadLocalComments();
  loadServerComments();

  // Handle comment input
  const commentInput = document.getElementById("comment-input");
  if (commentInput) {
    commentInput.addEventListener("change", function () {
      if (commentInput.value.trim()) {
        const pathname = window.location.pathname;
        const pageName = pathname.split("/").pop().replace(".html", "") || "index";

        // Initialize page array if doesn't exist
        if (!commentsData[pageName]) {
          commentsData[pageName] = [];
        }

        // Add new comment
        const newComment = {
          text: commentInput.value.trim(),
        };

        commentsData[pageName].push(newComment);

        // Save locally immediately
        saveLocalComments();
        displayComments();

        // Try to save to server (but don't wait)
        const serverUrl =
          window.location.hostname === "localhost"
            ? "http://localhost:3001/save-comment"
            : "https://meli-sh.onrender.com/save-comment";

        fetch(serverUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: pageName,
            comment: newComment.text,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Comment saved to server:", data);
          })
          .catch((error) => {
            console.log("Server save failed, but comment saved locally:", error);
          });

        // Clear input
        commentInput.value = "";
      }
    });
  }

  // Periodically sync with server
  setInterval(() => {
    loadServerComments();
  }, 30000); // Every 30 seconds
});
