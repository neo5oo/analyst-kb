// Keep favicon aligned with selected theme
(function () {
  const faviconEl = document.getElementById("favicon-svg");
  if (!faviconEl) return;

  const lightFavicon = '{{ "favicon.svg" | relURL }}';
  const darkFavicon = '{{ "favicon-dark.svg" | relURL }}';
  const mediaDark = window.matchMedia("(prefers-color-scheme: dark)");

  function getCurrentTheme() {
    if (document.documentElement.classList.contains("dark")) return "dark";
    if (document.documentElement.classList.contains("light")) return "light";
    return mediaDark.matches ? "dark" : "light";
  }

  function updateFavicon() {
    faviconEl.href = getCurrentTheme() === "dark" ? darkFavicon : lightFavicon;
  }

  updateFavicon();
  mediaDark.addEventListener("change", updateFavicon);

  const observer = new MutationObserver(updateFavicon);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
})();
