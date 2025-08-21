let commentsData = {};
const commentsPath =
  window.location.pathname.includes(".html") && !window.location.pathname.endsWith("index.html")
    ? "../comments.json"
    : "./comments.json";
    
// Function to display comments
function displayComments() {
  const container = document.getElementById("comments-container");
  if (!container) return;
  
  const pathname = window.location.pathname;
  const pageName = pathname.split('/').pop().replace('.html', '') || 'index';
  
  const pageComments = commentsData[pageName] || [];
  
  if (pageComments.length === 0) {
    container.innerHTML = '<div class="no-comments">No thoughts shared yet. Be the first!</div>';
  } else {
    container.innerHTML = pageComments.map((comment, index) => {
      // Random anonymous name for each comment
      const names = ["??inaccuracy", "??error", "??failed"];
      const randomName = names[Math.floor(Math.random() * names.length)];
      
      return `
        <div class="comment-item">
          <div class="comment-name">${randomName}</div>
          <div class="comment-text">${escapeHtml(comment.text)}</div>
        </div>
      `;
    }).reverse().join(''); // Show newest first
  }
}

// Helper function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Load and display comments
fetch(commentsPath)
  .then((response) => response.json())
  .then((data) => {
    commentsData = data;
    console.log("Comments loaded:", commentsData);
    displayComments();
  })
  .catch((error) => {
    console.log("Error loading comments:", error);
    displayComments(); // Display empty state
  });

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

const comment = document.getElementById("comment-input");
if (comment) {
  comment.addEventListener("change", function () {
    // Get page name from URL (e.g., "random1" from "/random/random1.html")
    const pathname = window.location.pathname;
    const pageName = pathname.split('/').pop().replace('.html', '') || 'index';
    
    // Send comment to server
    const serverUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001/save-comment'
      : 'https://meli-sh.onrender.com/save-comment';
    
    fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: pageName,
        comment: comment.value
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Comment saved:', data);
      // Update local commentsData
      if (!commentsData[pageName]) {
        commentsData[pageName] = [];
      }
      commentsData[pageName].push({
        text: comment.value,
        timestamp: new Date().toISOString()
      });
      // Refresh comments display
      displayComments();
      // Clear input after saving
      comment.value = '';
    })
    .catch(error => console.error('Error saving comment:', error));
  });
}
