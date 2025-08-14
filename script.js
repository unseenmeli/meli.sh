document.addEventListener("DOMContentLoaded", () => {
  // Define all project-description pairs
  const projects = [
    { project: "geoarsh", description: "p-for-geo" },
    { project: "weboneshot", description: "p-for-weboneshot" },
    { project: "oneshot", description: "p-for-oneshot" },
    { project: "fuzzy", description: "p-for-fuzzy" }
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