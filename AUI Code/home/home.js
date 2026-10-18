// Home page. Links that carry a sign-in, invite or other app state still go to the chat.
// The home page has no query string and only its own section anchors; anything else is an app link.
const HOME_ANCHORS = ["", "#privacy", "#skills", "#plans", "#desktop", "#main"];
if (location.search || !HOME_ANCHORS.includes(location.hash)) {
  location.replace("/chat/" + location.search + location.hash);
}

// Show an install button when the browser offers one.
let installPrompt = null;
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPrompt = event;
  const button = document.getElementById("installBtn");
  if (button) button.hidden = false;
});
document.getElementById("installBtn")?.addEventListener("click", async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice.catch(() => {});
  installPrompt = null;
  document.getElementById("installBtn").hidden = true;
});

// Parts of each section rise in turn as it scrolls into view.
if (!matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
  document.documentElement.classList.add("motion");
  const targets = [...document.querySelectorAll("main h1, main h2, main .lead, main .copy p, main .facts p, main .plans article, main .actions, main .shot, main .note")];
  const seen = new Map();
  targets.forEach(node => {
    const section = node.closest("section");
    const index = seen.get(section) || 0;
    seen.set(section, index + 1);
    node.classList.add("rise");
    node.style.setProperty("--delay", `${Math.min(index, 6) * 70}ms`);
  });
  const watcher = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in");
    watcher.unobserve(entry.target);
  }), { rootMargin: "0px 0px -8% 0px" });
  targets.forEach(node => watcher.observe(node));
}
