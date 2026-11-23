// router.js

// Variables
const routesFile = await fetch("routes.json");
const routesContent = await routesFile.json();
const routes = routesContent.routes;
const pagesPath = routesContent.pagesPath;

// Load component
async function loadComponent(element, path) {
  const name = path.split("/").at(-1);
  const html = await fetch(`${path}/${name}.html`);
  if (!html.ok) {
    console.error(`Could not find html for: ${path}`);
    return;
  }
  const htmlContent = await html.text();
  const template = document.createElement("template");
  template.innerHTML = htmlContent;
  const container = template.content.firstElementChild;
  container.dataset.comp = `${name}-${crypto.randomUUID()}`;
  element.replaceWith(container);
}

// Load page
async function loadPage() {
  const url = (window.location.hash || "#/").slice(1);
  const pageName = routes.find((route) => route[0] === url)?.[1] || "NotFound";
  const path = `${pagesPath}/${pageName}/${pageName}`;
  const html = await fetch(`${path}.html`);
  if (!html.ok) {
    console.error(`Could not load page: ${path}`);
    return;
  }
  const pageContent = await html.text();
  document.body.innerHTML = pageContent;
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
