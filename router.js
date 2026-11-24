// router.js

// Variables
const routesFile = await fetch("routes.json");
const routesContent = await routesFile.json();
const routes = routesContent.routes;
const pagesPath = routesContent.pagesPath;
const loadedCss = new Set();

// Turn folder path into file path
function getFilePath(folderPath) {
  const name = folderPath.split("/").at(-1);
  return `${folderPath}/${name}`;
}

// Load CSS
async function loadCss(folderPath) {
  // Cancel if path's CSS has been loaded
  if (loadedCss.has(folderPath)) {
    return;
  }

  // Get CSS file
  const filePath = getFilePath(folderPath);
  const css = await fetch(`${filePath}.css`);

  // Cancel if CSS file doesn't exist
  if (!css.ok) {
    console.error(`Could not load CSS: ${folderPath}`);
    return;
  }

  // Replace .main selector with element selector
  const id = `[data-elmt="${folderPath}"]`;
  let cssContent = await css.text();
  cssContent = cssContent.replace(/^\.main\s*\{/, `${id} {`);

  // Append CSS to head
  const styleElmt = document.createElement("style");
  styleElmt.textContent = cssContent;
  document.head.appendChild(styleElmt);

  // Save path to loaded CSS
  loadedCss.add(folderPath);
}

// Load component
async function loadComponent(element, folderPath) {
  const filePath = getFilePath(folderPath);
  const html = await fetch(`${filePath}.html`);
  if (!html.ok) {
    console.error(`Could not find html for: ${folderPath}`);
    return;
  }
  const htmlContent = await html.text();
  const template = document.createElement("template");
  template.innerHTML = htmlContent;
  const container = template.content.firstElementChild;
  container.dataset.elmt = folderPath;
  element.replaceWith(container);

  loadCss(folderPath);
}

// Load page
async function loadPage() {
  const url = (window.location.hash || "#/").slice(1);
  const pageName = routes.find((route) => route[0] === url)?.[1] || "NotFound";
  const folderPath = `${pagesPath}/${pageName}`;
  const filePath = `${folderPath}/${pageName}`;
  const html = await fetch(`${filePath}.html`);
  if (!html.ok) {
    console.error(`Could not load page: ${folderPath}`);
    return;
  }
  const pageContent = await html.text();
  document.body.innerHTML = pageContent;
  document.body.dataset.elmt = folderPath;

  loadCss(folderPath);
}

// Load new components
class SpaComponent extends HTMLElement {
  connectedCallback() {
    loadComponent(this, this.getAttribute("path"));
  }
}
customElements.define("spa-comp", SpaComponent);

// Load page on hash change
window.addEventListener("hashchange", loadPage);
loadPage();
