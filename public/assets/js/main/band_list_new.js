/**
 * Band List — all bands loaded once from window.__BANDS__.
 * Genre, country, sort handled in-memory. Only search triggers a page reload.
 * List view: alphabetical groups. Grid view: card grid with infinite scroll.
 */

document.addEventListener("DOMContentLoaded", function () {
  const bandGrid = document.getElementById("bandGrid");
  const loadingSpinner = document.getElementById("band-loading-spinner");

  if (!bandGrid) return;

  const PAGE_SIZE = 20;
  const masterBands = window.__BANDS__ || [];

  let displayBands = [];
  let currentView = "grid";

  const state = { rendered: 0, loading: false };

  // ─── Alpha nav (created once, shown only in list view) ────────────────────
  const alphaNav = document.createElement("div");
  alphaNav.id = "alpha-nav";
  alphaNav.className = "alpha-nav";
  alphaNav.style.display = "none";
  bandGrid.parentNode.insertBefore(alphaNav, bandGrid);

  const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

  function buildAlphaNav(availableLetters) {
    alphaNav.innerHTML = "";
    ALL_LETTERS.forEach(function (letter) {
      const btn = document.createElement("button");
      btn.className = "alpha-nav-btn" + (availableLetters.indexOf(letter) !== -1 ? " has-bands" : "");
      btn.textContent = letter;
      btn.type = "button";
      if (availableLetters.indexOf(letter) !== -1) {
        btn.addEventListener("click", function () {
          const target = document.getElementById("alpha-" + letter);
          if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      alphaNav.appendChild(btn);
    });
  }

  // ─── Filter + sort ────────────────────────────────────────────────────────

  function matchesSearch(band, search) {
    if (!search) return true;
    return (band.band_name || "").toLowerCase().includes(search.toLowerCase());
  }

  function matchesGenre(band, genre) {
    if (!genre) return true;
    return (band.band_genre || "").toLowerCase().includes(genre.toLowerCase().replace(/-/g, " "));
  }

  function matchesCountry(band, country) {
    if (!country) return true;
    const bc = (band.band_country || "").toLowerCase();
    const aliases = {
      "indonesia":      ["indonesia"],
      "united states":  ["united states", "usa", "america", "us"],
      "united kingdom": ["united kingdom", "uk", "britain", "england"],
    };
    const terms = aliases[country.toLowerCase()] || [country.toLowerCase()];
    return terms.some(function (t) { return bc.includes(t); });
  }

  function sortBands(arr, sortParam) {
    const sorted = arr.slice();
    if (sortParam === "name-asc") {
      sorted.sort(function (a, b) { return (a.band_name || "").localeCompare(b.band_name || ""); });
    } else if (sortParam === "name-desc") {
      sorted.sort(function (a, b) { return (b.band_name || "").localeCompare(a.band_name || ""); });
    } else {
      sorted.sort(function (a, b) { return (b.band_total_product || 0) - (a.band_total_product || 0); });
    }
    return sorted;
  }

  function applyFiltersAndSort() {
    const search  = searchInput   ? searchInput.value.trim()          : "";
    const genre   = genreFilter   ? genreFilter.value                 : "";
    const country = countryFilter ? countryFilter.value               : "";
    const sort    = sortFilter    ? sortFilter.value                  : "popular";

    displayBands = sortBands(
      masterBands.filter(function (b) {
        return matchesSearch(b, search) && matchesGenre(b, genre) && matchesCountry(b, country);
      }),
      sort
    );

    if (currentView === "list") {
      renderListView();
    } else {
      state.rendered = 0;
      bandGrid.innerHTML = "";
      renderNextBatch();
    }
  }

  // ─── Grid view ────────────────────────────────────────────────────────────

  function renderNextBatch() {
    if (state.loading) return;
    const batch = displayBands.slice(state.rendered, state.rendered + PAGE_SIZE);
    if (batch.length === 0) return;

    state.loading = true;
    if (loadingSpinner) loadingSpinner.style.display = "block";
    appendCards(batch);
    state.rendered += batch.length;
    if (loadingSpinner) loadingSpinner.style.display = "none";
    state.loading = false;
  }

  function appendCards(bands) {
    bands.forEach(function (band) {
      const card = document.createElement("div");
      card.className = "band-card";
      card.dataset.bandId = band.band_id;

      const genre      = (band.band_genre || "Metal").split(",")[0].trim();
      const thumbnail  = band.thumbnail || "/bands/default-thumbnail.jpg";
      const slug       = band.band_slug || band.band_name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const countryName = band.band_country || "Unknown";
      const countryFlag = band.bandCountryFlag || "🏴";

      card.innerHTML =
        '<div class="band-image-container">' +
        '<img src="' + escapeHtml(thumbnail) + '" alt="' + escapeHtml(band.band_name) +
        '" class="band-image" loading="lazy" />' +
        '<div class="band-overlay"><span class="band-genre">' + escapeHtml(genre) + "</span></div>" +
        "</div>" +
        '<div class="band-content">' +
        '<h3 class="band-name"><a href="/products?band=' + escapeHtml(slug) + '" style="color:inherit;text-decoration:none;">' + escapeHtml(band.band_name) + "</a></h3>" +
        '<div class="band-meta"><div class="band-country">' +
        '<span class="country-flag">' + countryFlag + "</span>" +
        "<span>" + escapeHtml(countryName) + "</span>" +
        "</div></div>" +
        (band.has_products
          ? '<a href="/products?band=' + escapeHtml(slug) + '" class="band-link">View ' +
            (band.band_total_product || "") + ' Products <i class="fas fa-arrow-right"></i></a>'
          : '<span class="band-link band-link-disabled">No Products</span>') +
        "</div>";

      bandGrid.appendChild(card);

      var nameEl = card.querySelector(".band-name");
      if (nameEl) fitBandName(nameEl);
    });
  }

  // ─── List view (alphabetical) ─────────────────────────────────────────────

  function renderListView() {
    bandGrid.innerHTML = "";
    bandGrid.classList.add("alpha-view");

    // Always A-Z in list view
    const sorted = displayBands.slice().sort(function (a, b) {
      return (a.band_name || "").localeCompare(b.band_name || "");
    });

    // Group by first letter
    const groups = {};
    sorted.forEach(function (band) {
      const first = (band.band_name || "?")[0].toUpperCase();
      const key = /[A-Z]/.test(first) ? first : "#";
      if (!groups[key]) groups[key] = [];
      groups[key].push(band);
    });

    const letters = Object.keys(groups).sort();
    buildAlphaNav(letters);

    letters.forEach(function (letter) {
      const section = document.createElement("div");
      section.className = "alpha-section";
      section.id = "alpha-" + letter;

      const header = document.createElement("div");
      header.className = "alpha-header";
      header.textContent = letter;
      section.appendChild(header);

      const bandInline = document.createElement("div");
      bandInline.className = "alpha-band-inline";

      groups[letter].forEach(function (band) {
        const slug = band.band_slug || band.band_name.toLowerCase().replace(/[^a-z0-9]/g, "-");

        if (band.has_products) {
          const a = document.createElement("a");
          a.className = "blist-name";
          a.href = "/products?band=" + escapeHtml(slug);
          a.textContent = band.band_name;
          bandInline.appendChild(a);
        } else {
          const span = document.createElement("span");
          span.className = "blist-name blist-name-disabled";
          span.textContent = band.band_name;
          bandInline.appendChild(span);
        }
      });

      section.appendChild(bandInline);

      bandGrid.appendChild(section);
    });
  }

  // ─── Shared ───────────────────────────────────────────────────────────────

  function fitBandName(el) {
    var MAX = 22, MIN = 10;
    el.style.fontSize = MAX + "px";
    if (el.scrollWidth <= el.offsetWidth) return;
    var lo = MIN, hi = MAX;
    while (hi - lo > 0.5) {
      var mid = (lo + hi) / 2;
      el.style.fontSize = mid + "px";
      if (el.scrollWidth <= el.offsetWidth) lo = mid; else hi = mid;
    }
    el.style.fontSize = lo + "px";
  }

  function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }

  // ─── Controls ─────────────────────────────────────────────────────────────

  const searchInput  = document.querySelector(".search-input");
  const genreFilter  = document.getElementById("genreFilter");
  const countryFilter = document.getElementById("countryFilter");
  const sortFilter   = document.getElementById("sortFilter");
  const resetButton  = document.getElementById("resetFilters");
  const viewButtons  = document.querySelectorAll(".view-btn");
  const sortWrapper  = sortFilter ? sortFilter.closest(".filter-select") || sortFilter.parentNode : null;

  // Restore filter state from URL params on load
  const urlParams = new URLSearchParams(window.location.search);
  if (genreFilter  && urlParams.get("genre"))   genreFilter.value   = urlParams.get("genre");
  if (countryFilter && urlParams.get("country")) countryFilter.value = urlParams.get("country");
  if (sortFilter   && urlParams.get("sort"))     sortFilter.value    = urlParams.get("sort");

  // Initial render
  applyFiltersAndSort();

  // Sentinel for infinite scroll (grid only)
  const sentinel = document.createElement("div");
  sentinel.id = "band-scroll-sentinel";
  sentinel.style.height = "1px";
  (loadingSpinner ? loadingSpinner.parentNode : bandGrid.parentNode).appendChild(sentinel);

  const observer = new IntersectionObserver(
    function (entries) {
      for (const entry of entries) {
        if (entry.isIntersecting && currentView === "grid" && state.rendered < displayBands.length) {
          renderNextBatch();
        }
      }
    },
    { rootMargin: "200px" }
  );
  observer.observe(sentinel);

  // Filters → in-memory
  if (genreFilter)   genreFilter.addEventListener("change",   applyFiltersAndSort);
  if (countryFilter) countryFilter.addEventListener("change", applyFiltersAndSort);
  if (sortFilter)    sortFilter.addEventListener("change",    applyFiltersAndSort);

  // Search → in-memory (debounced)
  if (searchInput) {
    let searchTimer;
    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(applyFiltersAndSort, 250);
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      window.location.href = window.location.pathname;
    });
  }

  // ─── View toggle ──────────────────────────────────────────────────────────
  viewButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const view = this.dataset.view;
      viewButtons.forEach(function (btn) { btn.classList.remove("active"); });
      this.classList.add("active");

      currentView = view;

      if (view === "list") {
        bandGrid.style.display = "block";
        bandGrid.classList.add("alpha-view");
        alphaNav.style.display = "flex";
        renderListView();
      } else {
        bandGrid.classList.remove("alpha-view");
        bandGrid.style.display = "";
        alphaNav.style.display = "none";
        state.rendered = 0;
        bandGrid.innerHTML = "";
        renderNextBatch();
      }
    });
  });
});
