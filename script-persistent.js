// Import InstantDB
import { init, tx, id } from "https://cdn.jsdelivr.net/npm/@instantdb/core/+esm";

// Initialize InstantDB
const db = init({
  appId: "161bcddc-4f2f-4922-bba7-4b89ccd1f253",
});

// Comments with InstantDB
document.addEventListener("DOMContentLoaded", () => {

  // Hero sigil: a soft light follows the pointer across the gold
  const sigil = document.querySelector(".sigil-hero");
  const hero = document.querySelector(".hero");
  if (sigil && hero && matchMedia("(hover: hover)").matches) {
    let raf = 0;
    hero.addEventListener("pointermove", (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = sigil.getBoundingClientRect();
        sigil.style.setProperty("--mx", `${e.clientX - r.left}px`);
        sigil.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
    hero.addEventListener("pointerleave", () => {
      sigil.style.removeProperty("--mx");
      sigil.style.removeProperty("--my");
    });
  }

  // Project cards: a gold light follows the pointer
  if (matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-glow]").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--gx", `${e.clientX - r.left}px`);
        card.style.setProperty("--gy", `${e.clientY - r.top}px`);
      });
    });
  }

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

  // Comments System with InstantDB
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

  // Get current page name
  function getPageName() {
    const pathname = window.location.pathname;
    return pathname.split("/").pop().replace(".html", "") || "index";
  }

  // Function to display comments
  function displayComments(comments) {
    const container = document.getElementById("comments-container");
    if (!container) return;

    if (comments.length === 0) {
      container.innerHTML = '<div class="no-comments">No thoughts shared yet. Be the first!</div>';
    } else {
      container.innerHTML = comments
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

  // Subscribe to comments for current page
  const pageName = getPageName();
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
      if (resp.data && resp.data.comments) {
        displayComments(resp.data.comments);
      }
    }
  );

  // Handle comment input
  const commentInput = document.getElementById("comment-input");
  if (commentInput) {
    commentInput.addEventListener("change", function () {
      if (commentInput.value.trim()) {
        // Add new comment to InstantDB
        db.transact([
          tx.comments[id()].update({
            page: pageName,
            text: commentInput.value.trim(),
            createdAt: Date.now(),
          }),
        ]);

        // Clear input
        commentInput.value = "";
      }
    });
  }
});
