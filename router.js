// router.js

console.log("Loaded!");
console.log("pathname:", window.location.pathname);
console.log("hash:", window.location.hash);

const routesFile = await fetch("routes.json");
const routesContent = await routesFile.json();
const routes = routesContent.routes;
const pagesPath = routesContent.pagesPath;

async function loadPage(pageName) {
  const path = `${pagesPath}/${pageName}/${pageName}`;
  const html = await fetch(`${path}.html`);
  if (!html.ok) {
    console.error(`Could not load page: ${path}`);
    return;
  }
  const pageContent = await html.text();
  document.body.innerHTML = pageContent;
}

async function loadComponent(path, element) {
  const html = await fetch(`${path}.html`);
  if (!html.ok) {
    console.error(`Could not find html for: ${path}`);
    return;
  }
  const htmlContent = await html.text();
  const template = document.createElement("template");
  template.innerHTML = htmlContent;
  element.replaceWith(template.content);
}

async function router() {
  const url = (window.location.hash || "#/").slice(1);
  const pageName = routes.find((route) => route[0] === url)?.[1] || "NotFound";
  await loadPage(pageName);
}

window.addEventListener("hashchange", router);
router();
