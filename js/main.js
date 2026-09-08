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

  const calc = document.getElementById("calc-1rm");
  if (calc) {
    const formulas = {
      epley: (w, r) => w * (1 + r / 30),
      brzycki: (w, r) => w / (1.0278 - 0.0278 * r),
      lombardi: (w, r) => w * Math.pow(r, 0.1),
      mayhew: (w, r) => (100 * w) / (52.2 + 41.9 * Math.exp(-0.055 * r)),
      oconner: (w, r) => w * (1 + r / 40),
      wathan: (w, r) => (100 * w) / (48.8 + 53.8 * Math.exp(-0.075 * r)),
    };
    const weightInput = calc.querySelector("#calc-1rm-weight");
    const repsInput = calc.querySelector("#calc-1rm-reps");
    const formulaSelect = calc.querySelector("#calc-1rm-formula");
    const output = calc.querySelector("#calc-1rm-output");

    const format = (n) =>
      n.toLocaleString("es-ES", { maximumFractionDigits: 1, minimumFractionDigits: 0 });

    const run = () => {
      const weight = Number(weightInput.value);
      const reps = Number(repsInput.value);
      const unit = (calc.querySelector('input[name="unit"]:checked') || {}).value || "kg";
      const fn = formulas[formulaSelect.value] || formulas.epley;
      if (!(weight > 0) || !(reps >= 1) || !Number.isFinite(weight) || !Number.isFinite(reps)) {
        output.textContent = "—";
        return;
      }
      if (formulaSelect.value === "brzycki" && reps >= 37) {
        output.textContent = "Brzycki no es válida por encima de 36 repeticiones";
        return;
      }
      const oneRm = fn(weight, reps);
      if (!Number.isFinite(oneRm) || oneRm <= 0) {
        output.textContent = "—";
        return;
      }
      output.textContent = `${format(oneRm)} ${unit}`;
    };

    calc.addEventListener("submit", (e) => {
      e.preventDefault();
      run();
    });
    calc.addEventListener("change", run);
    calc.addEventListener("input", run);
    run();
  }
});
