(function () {
  "use strict";

  const data = window.DISH_DATA;

  const CHIP_ICONS = {
    heart:
      '<svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.3-9A5.3 5.3 0 0 1 12 6a5.3 5.3 0 0 1 9.3 6C19 16.5 12 21 12 21Z"/></svg>',
    fork: '<svg viewBox="0 0 24 24"><path d="M8 2v9a2 2 0 0 0 2 2v9h2v-9a2 2 0 0 0 2-2V2h-1v7h-2V2h-1v7H9V2H8Zm9 0a3 3 0 0 0-3 3v8h2v9h2V2Z"/></svg>',
    fish: '<svg viewBox="0 0 24 24"><path d="M2 12c3-5 9-6 13-4l3-3v6l2 1-2 1v6l-3-3c-4 2-10 1-13-4Zm13-1a1 1 0 1 0 1 1 1 1 0 0 0-1-1Z"/></svg>',
    sun: '<svg viewBox="0 0 24 24"><path d="M12 7a5 5 0 1 1-5 5 5 5 0 0 1 5-5Zm0-5v3m0 14v3m9-9h-3M5 12H2m15.5-6.5-2 2M7.5 16.5l-2 2m13 0-2-2M7.5 7.5l-2-2"/></svg>',
    taco: '<svg viewBox="0 0 24 24"><path d="M12 4a9 9 0 0 0-9 9v1h18v-1a9 9 0 0 0-9-9Zm-5 7c2 2 4 2 5 2s3 0 5-2-1 5-5 5-7-3-5-5Z"/></svg>',
    glass:
      '<svg viewBox="0 0 24 24"><path d="M5 3h14l-2 8a5 5 0 0 1-4 4v5h3v1H8v-1h3v-5a5 5 0 0 1-4-4Z"/></svg>',
    cake: '<svg viewBox="0 0 24 24"><path d="M12 2a1.5 1.5 0 0 1 1.5 1.5c0 1-1.5 2-1.5 2s-1.5-1-1.5-2A1.5 1.5 0 0 1 12 2Zm-6 6h12a2 2 0 0 1 2 2v4H4v-4a2 2 0 0 1 2-2Zm-2 8h16v4H4Z"/></svg>',
    flame:
      '<svg viewBox="0 0 24 24"><path d="M12 2s5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-3s2 1 3-1-1-4 1-6Z"/></svg>',
  };

  const PIN_SVG =
    '<svg viewBox="0 0 24 24" class="pin"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>';
  const FORK_SVG =
    '<svg viewBox="0 0 24 24"><path d="M8 2v9a2 2 0 0 0 2 2v9h2v-9a2 2 0 0 0 2-2V2h-1v7h-2V2h-1v7H9V2H8Zm9 0a3 3 0 0 0-3 3v8h2v9h2V2Z"/></svg>';

  /* ---------- render ---------- */

  function renderChips() {
    const track = document.getElementById("chips-track");
    track.innerHTML = data.categories
      .map(
        (c) => `
          <button class="chip${c.active ? " active" : ""}" data-id="${c.id}">
            ${CHIP_ICONS[c.icon] || ""}
            <span>${c.label}</span>
          </button>`,
      )
      .join("");

    track.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      track.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
    });
  }

  function renderMoreDishes() {
    const track = document.getElementById("more-dishes");
    track.innerHTML = data.moreDishes
      .map(
        (d) => `
          <article class="dish" data-id="${d.id}">
            <div class="dish-img" style="background-image: url('${d.img}')"></div>
            <div class="dish-body">
              <h4 class="dish-name">${d.name}</h4>
              <div class="dish-meta">
                <span>${PIN_SVG} ${d.distance}</span>
                <span class="dish-likes">${FORK_SVG} ${d.likes}</span>
              </div>
            </div>
          </article>`,
      )
      .join("");
  }

  function renderCurated() {
    const track = document.getElementById("curated");
    track.innerHTML = data.curated
      .map(
        (c) => `
          <article class="curated" data-id="${c.id}" style="background-image: url('${c.img}')">
            <div class="curated-label">
              ${c.title}
              <small>${c.sub}</small>
            </div>
          </article>`,
      )
      .join("");
  }

  /* ---------- interactions ---------- */

  function wireTabs() {
    const tabs = document.querySelectorAll(".tab");
    const home = document.querySelector('.tab[data-tab="home"]');
    if (home) home.classList.add("active");
    tabs.forEach((t) => {
      t.addEventListener("click", () => {
        tabs.forEach((x) => x.classList.remove("active"));
        t.classList.add("active");
      });
    });
  }

  function wireHero() {
    const likeBtn = document.querySelector('.stat[data-action="like"]');
    const likeCount = likeBtn?.querySelector('[data-count="likes"]');
    let liked = false;
    let likes = Number(likeCount?.textContent || 0);
    likeBtn?.addEventListener("click", () => {
      liked = !liked;
      likes += liked ? 1 : -1;
      if (likeCount) likeCount.textContent = likes;
      likeBtn.style.transform = "scale(1.08)";
      setTimeout(() => (likeBtn.style.transform = ""), 120);
    });

    document.querySelector(".play-btn")?.addEventListener("click", () => {
      console.log("[dish] play video for Bella Roma");
    });

    document.querySelector(".menu-btn")?.addEventListener("click", () => {
      console.log("[dish] open menu for Bella Roma");
    });
  }

  function wireSearch() {
    const form = document.querySelector(".search");
    const input = document.getElementById("search-input");
    form?.addEventListener("submit", () => {
      const q = (input?.value || "").trim();
      if (q) console.log("[dish] search:", q);
    });
  }

  /* ---------- boot ---------- */

  document.addEventListener("DOMContentLoaded", () => {
    renderChips();
    renderMoreDishes();
    renderCurated();
    wireTabs();
    wireHero();
    wireSearch();
  });
})();
