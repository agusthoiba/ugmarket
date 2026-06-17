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
  const kategoriCheckboxes = document.querySelectorAll('input[name="kategori"]');

  // Accordion functionality
  const accordionTriggers = document.querySelectorAll(".mobile-accordion-trigger")
  const desktopAccordionTriggers = document.querySelectorAll(".desktop-accordion-trigger")

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
  });

  // Desktop accordion functionality (independent per section)
  desktopAccordionTriggers.forEach((trigger) => {
    trigger.addEventListener("click", function () {
      const target = document.getElementById(this.dataset.target)
      const isActive = this.classList.contains("active")

      // Toggle only this section
      if (isActive) {
        this.classList.remove("active")
        if (target) target.classList.remove("active")
      } else {
        this.classList.add("active")
        if (target) target.classList.add("active")
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

    // Check seller input
    const sellerInput = document.getElementById('seller-input')
    if (sellerInput && sellerInput.value.trim()) {
      activeFilters.push({ type: 'seller', value: sellerInput.value.trim(), label: `Penjual: ${sellerInput.value.trim()}` })
    }

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

        if (type === 'seller') {
          const sellerInput = document.getElementById('seller-input')
          const mobileSellerInput = document.getElementById('mobile-seller-input')
          if (sellerInput) sellerInput.value = ''
          if (mobileSellerInput) mobileSellerInput.value = ''
        } else {
          // Uncheck the corresponding checkbox
          const checkbox = document.querySelector(`input[name="${type}"][value="${value}"]`)
          if (checkbox) checkbox.checked = false
        }

        updateActiveFilters()
        applyFilters()
      })
    })
  }

  // Apply filters
  function applyFilters() {
    const params = new URLSearchParams()

    // Collect all checked filters
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked')
    let sizes = [];
    let conditions = [];
    let categories = [];
    let kategori = ''; // kategori for parent category
    let country = ''; // country filter
    
    checkboxes.forEach((checkbox) => {
      if (checkbox.name == "sizes") {
        sizes.push(checkbox.value);
      } else if (checkbox.name == "condition") {
        conditions.push(checkbox.value);
      } else if (checkbox.name == "categories") {
        categories.push(checkbox.value);
      } else if (checkbox.name == "kategori") {
        kategori = checkbox.value;
      } else if (checkbox.name == "country") {
        country = checkbox.value;
      }
    });

    // Only add parameters if they have values
    if (sizes.length > 0) { 
      params.append("sizes", sizes.join(','));
    }

    if (conditions.length > 0) { 
      params.append("condition", conditions.join(','));
    }

    if (kategori !== '') { 
      params.append("kategori", kategori);
    }

    if (categories.length > 0) { 
      params.append("categories", categories.join(','));
    }

    if (country !== '') { 
      params.append("country", country);
    }

    // Check for sort from radio buttons or select dropdowns
    const checkedRadio = document.querySelector('input[type="radio"]:checked');
    const sortSelect = document.getElementById("sort-select");
    const sortSelectDesktop = document.getElementById("sort-select-desktop");
    
    if (checkedRadio) {
      params.append("sort", checkedRadio.value)
    } else if (sortSelect && sortSelect.value) {
      params.append("sort", sortSelect.value)
    } else if (sortSelectDesktop && sortSelectDesktop.value) {
      params.append("sort", sortSelectDesktop.value)
    }

    // Handle seller input
    const desktopSellerInput = document.getElementById('seller-input')
    const mobileSellerInput = document.getElementById('mobile-seller-input')
    const sellerVal = (desktopSellerInput && desktopSellerInput.value.trim())
      || (mobileSellerInput && mobileSellerInput.value.trim())
      || ''
    if (sellerVal) params.append('seller', sellerVal)

    // Handle price inputs separately
    const priceMinInput = document.getElementById('price-min');
    const priceMaxInput = document.getElementById('price-max');
    
    // Only add price parameters if they have values
    if (priceMinInput && priceMinInput.value) {
        params.append('price_min', priceMinInput.value);
    }
    if (priceMaxInput && priceMaxInput.value) {
        params.append('price_max', priceMaxInput.value);
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

    // Clear seller inputs
    const sellerInput = document.getElementById('seller-input')
    const mobileSellerInput = document.getElementById('mobile-seller-input')
    if (sellerInput) sellerInput.value = ''
    if (mobileSellerInput) mobileSellerInput.value = ''

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

    // Sync mobile seller to desktop seller
    const mobileSellerVal = document.getElementById('mobile-seller-input')
    const desktopSellerInput = document.getElementById('seller-input')
    if (mobileSellerVal && desktopSellerInput) {
      desktopSellerInput.value = mobileSellerVal.value.trim()
    }

    closeMobileFilter()
    updateActiveFilters()
    applyFilters()
  })

  // Listen for filter changes on desktop
  document.querySelectorAll('.desktop-filters input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      updateActiveFilters()

      // Auto-apply filters on desktop (optional)
      applyFilters();
    })
  })

  // Listen for sort changes on desktop
  document.querySelectorAll('.desktop-filters input[type="radio"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      applyFilters();
    })
  })

  // Listen for price input changes on desktop
  const priceMinInput = document.getElementById('price-min');
  const priceMaxInput = document.getElementById('price-max');
  
  if (priceMinInput) {
    priceMinInput.addEventListener("input", () => {
      setTimeout(() => applyFilters(), 500); // Debounce for 500ms
    });
  }

  if (priceMaxInput) {
    priceMaxInput.addEventListener("input", () => {
      setTimeout(() => applyFilters(), 500); // Debounce for 500ms
    });
  }

  const sellerInput = document.getElementById('seller-input')
  if (sellerInput) {
    let sellerDebounce
    sellerInput.addEventListener("input", () => {
      clearTimeout(sellerDebounce)
      sellerDebounce = setTimeout(() => {
        updateActiveFilters()
        applyFilters()
      }, 600)
    })
  }

  // Listen for sort changes
  const sortSelect = document.getElementById("sort-input")
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      applyFilters()
    })
  }

  // Listen for desktop sort changes
  const sortSelectDesktop = document.getElementById("sort-select-desktop")
  if (sortSelectDesktop) {
    sortSelectDesktop.addEventListener("change", () => {
      applyFilters()
    })
  }

  // Initialize active filters on page load
  updateActiveFilters()

  // Auto-open accordion sections with selected filters
  desktopAccordionTriggers.forEach((trigger) => {
    const target = document.getElementById(trigger.dataset.target)
    if (target) {
      const checkedCheckboxes = target.querySelectorAll('input[type="checkbox"]:checked')
      if (checkedCheckboxes.length > 0) {
        trigger.classList.add("active")
        target.classList.add("active")
      }
    }
  })

  // Sync mobile filters with desktop on page load
  /*document.querySelectorAll('.desktop-filters input[type="checkbox"]:checked').forEach((desktopCheckbox) => {
    const name = "mobile-" + desktopCheckbox.name
    const value = desktopCheckbox.value
    const mobileCheckbox = document.querySelector(`input[name="${name}"][value="${value}"]`)
    if (mobileCheckbox) {
      mobileCheckbox.checked = true
    }
  })*/

  kategoriCheckboxes.forEach((checkbox) => {
    const selectedKategori = checkbox.checked ? checkbox.value : null;

    checkbox.addEventListener("change", () => {
      const childCheckboxes = document.querySelectorAll(`input[name="categories"][data-parentslug="${checkbox.value}"]`);
      childCheckboxes.forEach((checkboxChild) => {
        checkboxChild.checked = checkbox.checked;
      });
    });
  });

})

function onlyNumberKey(evt) {
    // Only ASCII character in that range allowed
  var ASCIICode = (evt.which) ? evt.which : evt.keyCode;
  if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57)) {
    return false;
  }
  return true;
}

function validatePrice(input) {
    // Remove any non-numeric characters
    input.value = input.value.replace(/[^0-9]/g, '');
    
    const minPrice = document.getElementById('price-min');
    const maxPrice = document.getElementById('price-max');
    const alertPriceMin = document.getElementById('alert-price-min');
    const alertPriceMax = document.getElementById('alert-price-max');

        // Clear previous error states
    alertPriceMin.innerText = '';
    alertPriceMax.innerText = '';
    minPrice.classList.remove('is-invalid');
    maxPrice.classList.remove('is-invalid');

    console.log("maxPrice.value:", maxPrice.value, Number(maxPrice.value));
    console.log("minPrice.value:", minPrice.value, Number(minPrice.value));

    const minPriceVal = minPrice.value ? Number(minPrice.value) : 0;
    const maxPriceVal = maxPrice.value ? Number(maxPrice.value) : Infinity;

    // Handle different input scenarios
    if (input.id === 'price-min') {
        if (maxPrice.value && minPriceVal > maxPriceVal) {
            alertPriceMin.innerText = 'Nilai harus lebih kecil dari harga maksimum';
            input.classList.add('is-invalid');
        }
    } else if (input.id === 'price-max') {
        if (minPrice.value && maxPriceVal < minPriceVal) {
            alertPriceMax.innerText = 'Nilai harus lebih besar dari harga minimum';
            input.classList.add('is-invalid');
        }
    }

    // Additional validation if both values are present
    if (minPrice.value && maxPrice.value && maxPriceVal < minPriceVal) {
        if (input.id === 'price-min') {
            alertPriceMin.innerText = 'Nilai harus lebih kecil dari harga maksimum';
            input.classList.add('is-invalid');
        } else {
            alertPriceMax.innerText = 'Nilai harus lebih besar dari harga minimum';
            input.classList.add('is-invalid');
        }
    }    
}
