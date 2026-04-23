// Light / Dark theme toggle (without "system" option in the menu)
(function () {
  const defaultThemeRaw = '{{ site.Params.theme.default | default `light`}}';
  const themes = ["light", "dark"];
  const mediaDark = window.matchMedia("(prefers-color-scheme: dark)");

  function normalizeTheme(theme) {
    if (themes.includes(theme)) return theme;
    if (defaultThemeRaw === "system") return mediaDark.matches ? "dark" : "light";
    return themes.includes(defaultThemeRaw) ? defaultThemeRaw : "light";
  }

  const themeToggleButtons = document.querySelectorAll(".hextra-theme-toggle");

  function applyTheme(theme) {
    const normalized = normalizeTheme(theme);

    themeToggleButtons.forEach((btn) => {
      btn.parentElement.dataset.theme = normalized;
    });

    localStorage.setItem("color-theme", normalized);
  }

  function switchTheme(theme) {
    const normalized = normalizeTheme(theme);
    setTheme(normalized);
    applyTheme(normalized);
  }

  const colorTheme = "color-theme" in localStorage ? localStorage.getItem("color-theme") : defaultThemeRaw;
  switchTheme(colorTheme);

  themeToggleButtons.forEach((toggler) => {
    toggler.addEventListener("click", function (e) {
      e.preventDefault();
      const currentTheme = localStorage.getItem("color-theme");
      const normalizedCurrent = normalizeTheme(currentTheme);
      const nextTheme = normalizedCurrent === "dark" ? "light" : "dark";
      switchTheme(nextTheme);
    });
  });
})();
