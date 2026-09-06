document.addEventListener("DOMContentLoaded", () => {
  const baseUrl = (window.__BASE_URL__ || "/").replace(/\/?$/, "/");
  const withBase = (path) => {
    if (!path) return baseUrl;
    if (/^(https?:)?\/\//i.test(path)) return path;
    if (path.startsWith(baseUrl)) return path;
    return baseUrl.replace(/\/$/, "") + (path.startsWith("/") ? path : "/" + path);
  };

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("li").forEach((li) => {
      if (li.querySelector(":scope > .sub-menu")) {
        const link = li.querySelector(":scope > a");
        if (link && !link.getAttribute("href")) {
          link.addEventListener("click", (e) => {
            if (window.matchMedia("(max-width: 768px)").matches) {
              e.preventDefault();
              li.classList.toggle("is-open");
            }
          });
        }
      }
    });
  }

  const toc = document.querySelector(".toc");
  const tocToggle = document.querySelector(".toc__toggle");
  if (toc && tocToggle) {
    tocToggle.addEventListener("click", (e) => {
      e.preventDefault();
      const collapsed = toc.classList.toggle("is-collapsed");
      tocToggle.textContent = collapsed ? "mostrar" : "ocultar";
    });
  }

  const back = document.querySelector(".back-to-top");
  if (back) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) back.classList.add("is-visible");
      else back.classList.remove("is-visible");
    });
    back.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const form = document.querySelector(".search-form");
  const input = document.querySelector(".search-field");
  const results = document.getElementById("search-results");
  if (form && input && results) {
    let index = null;
    const loadIndex = async () => {
      if (index) return index;
      const res = await fetch(withBase("/search-index.json"));
      index = await res.json();
      return index;
    };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const q = input.value.trim().toLowerCase();
      results.innerHTML = "";
      if (!q) return;
      const data = await loadIndex();
      const hits = data
        .filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            (item.description || "").toLowerCase().includes(q)
        )
        .slice(0, 12);
      hits.forEach((hit) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="${withBase(hit.permalink)}">${hit.title}</a>`;
        results.appendChild(li);
      });
      if (!hits.length) {
        results.innerHTML = "<li>Sin resultados</li>";
      }
    });
  }
});
