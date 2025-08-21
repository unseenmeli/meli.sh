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

let readerCount = 0;
const readerElement = document.getElementById("reader-count");

if (readerElement) {
  readerCount = 1;
  readerElement.textContent = readerCount;
}

function checkVisibility() {
  if (document.visibilityState === "visible") {
    console.log("Tab is visible - user is here");
    readerCount = 1;
    if (readerElement) readerElement.textContent = readerCount;
    return true;
  } else {
    console.log("Tab is hidden - user switched away");
    readerCount = 0;
    if (readerElement) readerElement.textContent = readerCount;
    return false;
  }
}

document.addEventListener("visibilitychange", () => {
  checkVisibility();
});
i;
checkVisibility();

console.log(readerElement);
