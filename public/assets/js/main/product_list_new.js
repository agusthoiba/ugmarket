document.addEventListener("DOMContentLoaded", () => {
  console.log("Product List New JS Loaded")

  const sortSelectOption = document.getElementById("sort-select");
  if (sortSelectOption) {
    sortSelectOption.addEventListener("change", function() {
      const sortVal = sortSelectOption.value;
      console.log('sortVal', sortVal);
      const url = new URL(window.location.href);
      url.searchParams.set('sort', sortVal);
      window.location.href = url.toString();
    });
  }

  // Mobile filter functionality
  const mobileFilterBtn = document.getElementById("mobile-filter-btn")
  const mobileFilterOverlay = document.getElementById("mobile-filter-overlay")
  const closeFilterBtn = document.getElementById("close-filter-btn")
  const applyFiltersBtn = document.getElementById("apply-filters-btn")
  const clearFiltersBtn = document.getElementById("clear-filters-btn")
  const activeFiltersContainer = document.getElementById("active-filters")

  // Accordion functionality
  const accordionTriggers = document.querySelectorAll(".mobile-accordion-trigger")

  // Open mobile filter
  mobileFilterBtn.addEventListener("click", () => {
    mobileFilterOverlay.classList.add("active")
    document.body.style.overflow = "hidden"
  })

  // Close mobile filter
  function closeMobileFilter() {
    mobileFilterOverlay.classList.remove("active")
    document.body.style.overflow = ""
  }

  closeFilterBtn.addEventListener("click", closeMobileFilter)

  // Close on overlay click
  mobileFilterOverlay.addEventListener("click", (e) => {
    if (e.target === mobileFilterOverlay) {
      closeMobileFilter()
    }
  })

  // Accordion functionality
  accordionTriggers.forEach((trigger) => {
    trigger.addEventListener("click", function () {
      const target = document.getElementById(this.dataset.target)
      const isActive = this.classList.contains("active")

      // Close all accordions
      accordionTriggers.forEach((t) => {
        t.classList.remove("active")
        const content = document.getElementById(t.dataset.target)
        if (content) content.classList.remove("active")
      })

      // Open clicked accordion if it wasn't active
      if (!isActive) {
        this.classList.add("active")
        target.classList.add("active")
      }
    })
  })

  // Filter management
  function updateActiveFilters() {
    const activeFilters = []

    // Check desktop filters
    const desktopCheckboxes = document.querySelectorAll('.desktop-filters input[type="checkbox"]:checked')
    desktopCheckboxes.forEach((checkbox) => {
      const section = checkbox.closest(".filter-section").querySelector(".filter-title").textContent
      const label = checkbox.closest(".filter-option").textContent.trim()
      activeFilters.push({ type: checkbox.name, value: checkbox.value, label: `${section}: ${label}` })
    })

    // Update active filters display
    activeFiltersContainer.innerHTML = ""
    activeFilters.forEach((filter) => {
      const badge = document.createElement("div")
      badge.className = "active-filter-badge"
      badge.innerHTML = `
                ${filter.label}
                <button class="remove-filter" data-type="${filter.type}" data-value="${filter.value}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `
      activeFiltersContainer.appendChild(badge)
    })

    // Add remove filter functionality
    document.querySelectorAll(".remove-filter").forEach((btn) => {
      btn.addEventListener("click", function () {
        const type = this.dataset.type
        const value = this.dataset.value

        // Uncheck the corresponding checkbox
        const checkbox = document.querySelector(`input[name="${type}"][value="${value}"]`)
        if (checkbox) {
          checkbox.checked = false
        }

        updateActiveFilters()
        applyFilters()
      })
    })
  }

  // Apply filters
  function applyFilters() {
    const formData = new FormData()

    // Collect all checked filters
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked')
    let sizes = '';
    checkboxes.forEach((checkbox) => {
      if (checkbox.name == "sizes") {
        console.log('checkbox.value:', checkbox.value);
        sizes += checkbox.value + ',';
      } else {
        formData.append(checkbox.name, checkbox.value)
      } 
    });

    if (sizes !== '') { 
      sizes = sizes.slice(0, -1); // Remove trailing comma
      console.log("sizes:", sizes)
      formData.append("sizes", sizes);
    }

    const checkedRadio = document.querySelector('input[type="radio"]:checked');
    if (checkedRadio) {
      // checkedRadio.value contains the selected value
      const sortInput = document.getElementById("sort-input")

      console.log('sortInput', sortInput);
 
      if (sortInput) {
        sortInput.value = checkedRadio.value;
        formData.append("sort", sortSelect.value)
      }
    }

    const prices = document.querySelector('input[name="price"]');
    console.log('prices: ', prices);
    console.log('prices.value:', prices.value);

    const priceMinInput = document.getElementById('price-min');
    const priceMaxInput = document.getElementById('price-max');
    const priceMin = priceMinInput ? priceMinInput.value : '';
    const priceMax = priceMaxInput ? priceMaxInput.value : '';

    if (priceMin) formData.append('price_min', priceMin);
    if (priceMax) formData.append('price_max', priceMax);

    console.log("formData.entries:", formData.entries())

    // Build query string
    const params = new URLSearchParams()
    for (const [key, value] of formData.entries()) {
      params.append(key, value)
    }

    console.log("params.toString():", params.toString())

    // Redirect with filters
    window.location.href = `${window.location.pathname}?${params.toString()}`
  }

  // Clear all filters
  clearFiltersBtn.addEventListener("click", () => {
    // Uncheck all checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = false
    })

    // Reset sort to default
    const sortSelect = document.getElementById("sort-input")
    if (sortSelect) {
      sortSelect.value = "popularitas"
    }

    updateActiveFilters()
  })

  // Apply filters and close mobile sheet
  applyFiltersBtn.addEventListener("click", () => {
    // Sync mobile filters to desktop filters
    const mobileCheckboxes = document.querySelectorAll('.mobile-filter-sheet input[type="checkbox"]:checked')
    const mobileRadios = document.querySelectorAll('.mobile-filter-sheet input[type="radio"]:checked')

    // Clear desktop filters first
    document.querySelectorAll('.desktop-filters input[type="checkbox"]').forEach((cb) => (cb.checked = false))

    // Apply mobile checkbox selections to desktop
    mobileCheckboxes.forEach((mobileCheckbox) => {
      const name = mobileCheckbox.name.replace("mobile-", "")
      const value = mobileCheckbox.value
      const desktopCheckbox = document.querySelector(`.desktop-filters input[name="${name}"][value="${value}"]`)
      if (desktopCheckbox) {
        desktopCheckbox.checked = true
      }
    })

    // Apply sort selection
    mobileRadios.forEach((radio) => {
      if (radio.name === "mobile-sort") {
        const sortSelect = document.getElementById("sort-input")
        if (sortSelect) {
          sortSelect.value = radio.value
        }
      }
    })

    closeMobileFilter()
    updateActiveFilters()
    applyFilters()
  })

  // Listen for filter changes on desktop
  document.querySelectorAll('.desktop-filters input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      updateActiveFilters()

      // Auto-apply filters on desktop (optional)
      // applyFilters();
    })
  })

  // Listen for sort changes
  const sortSelect = document.getElementById("sort-input")
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      applyFilters()
    })
  }

  // Initialize active filters on page load
  updateActiveFilters()

  // Sync mobile filters with desktop on page load
  document.querySelectorAll('.desktop-filters input[type="checkbox"]:checked').forEach((desktopCheckbox) => {
    const name = "mobile-" + desktopCheckbox.name
    const value = desktopCheckbox.value
    const mobileCheckbox = document.querySelector(`input[name="${name}"][value="${value}"]`)
    if (mobileCheckbox) {
      mobileCheckbox.checked = true
    }
  })
})
