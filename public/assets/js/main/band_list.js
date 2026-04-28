/**
 * Band List Interactivity
 * Handles search, filtering, sorting, and view toggling for the band list page
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize band list functionality
  const bandList = new BandList();
  bandList.init();
});

class BandList {
  constructor() {
    this.searchInput = document.querySelector(".search-input");
    this.genreFilter = document.getElementById("genreFilter");
    this.countryFilter = document.getElementById("countryFilter");
    this.sortFilter = document.getElementById("sortFilter");
    this.viewButtons = document.querySelectorAll(".view-btn");
    this.resetButton = document.getElementById("resetFilters");
    this.bandGrid = document.getElementById("bandGrid");
    this.bandCards = document.querySelectorAll(".band-card");
    this.statNumber = document.querySelector(".stat-number");
  }

  init() {
    this.setupEventListeners();
    this.setupImageLoading();
  }

  setupEventListeners() {
    // Search functionality
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => this.handleSearch(e));
    }

    // Filter functionality
    if (this.genreFilter) {
      this.genreFilter.addEventListener("change", () => this.applyFilters());
    }

    if (this.countryFilter) {
      this.countryFilter.addEventListener("change", () => this.applyFilters());
    }

    // Sort functionality
    if (this.sortFilter) {
      this.sortFilter.addEventListener("change", (e) => this.handleSort(e));
    }

    // View toggle
    this.viewButtons.forEach((button) => {
      button.addEventListener("click", (e) => this.handleViewToggle(e));
    });

    // Reset filters
    if (this.resetButton) {
      this.resetButton.addEventListener("click", () => this.resetFilters());
    }
  }

  updateURLWithFilters(filters = {}) {
    // Update URL with filter parameters
    const url = new URL(window.location.href);

    console.log("url Search before", url);

    // Update or remove each filter parameter
    if (filters.search !== undefined) {
      if (filters.search) {
        url.searchParams.set("search", filters.search);
      } else {
        url.searchParams.delete("search");
      }
    }

    if (filters.genre !== undefined) {
      if (filters.genre) {
        url.searchParams.set("genre", filters.genre);
      } else {
        url.searchParams.delete("genre");
      }
    }

    if (filters.country !== undefined) {
      if (filters.country) {
        url.searchParams.set("country", filters.country);
      } else {
        url.searchParams.delete("country");
      }
    }

    if (filters.sort !== undefined) {
      if (filters.sort) {
        url.searchParams.set("sort", filters.sort);
      } else {
        url.searchParams.delete("sort");
      }
    }

    // Remove page parameter when filters change (go back to page 1)
    if (filters.page === null) {
      url.searchParams.delete("page");
    }

    console.log("url Search", url);

    // Navigate to new URL
    //window.location.href = url.toString();
  }

  handleSearch(event) {
    const searchTerm = event.target.value.trim();

    console.log("searchTerm: ", searchTerm);

    // Update URL with search parameter
    this.updateURLWithFilters({
      search: searchTerm || null,
      page: null, // Reset to page 1 when searching
    });
  }

  applyFilters() {
    const selectedGenre = this.genreFilter?.value || "";
    const selectedCountry = this.countryFilter?.value || "";

    // Update URL with filter parameters
    this.updateURLWithFilters({
      genre: selectedGenre || null,
      country: selectedCountry || null,
      page: null, // Reset to page 1 when filtering
    });
  }

  handleSort(event) {
    const sortValue = event.target.value;

    // Update URL with new sort parameter (this will trigger a page reload)
    this.updateURLWithFilters({
      sort: sortValue,
      page: null, // Reset to page 1 when sorting
    });
  }

  handleViewToggle(event) {
    const button = event.currentTarget;
    const view = button.dataset.view;

    // Update active button
    this.viewButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    // Change grid layout
    if (view === "list") {
      this.bandGrid.style.gridTemplateColumns = "1fr";
      this.bandCards.forEach((card) => {
        card.style.flexDirection = "row";
        const imageContainer = card.querySelector(".band-image-container");
        if (imageContainer) {
          imageContainer.style.flex = "0 0 150px";
          imageContainer.style.height = "150px";
        }
      });
    } else {
      this.bandGrid.style.gridTemplateColumns =
        "repeat(auto-fill, minmax(280px, 1fr))";
      this.bandCards.forEach((card) => {
        card.style.flexDirection = "column";
        const imageContainer = card.querySelector(".band-image-container");
        if (imageContainer) {
          imageContainer.style.flex = "none";
          imageContainer.style.height = "200px";
        }
      });
    }
  }

  resetFilters() {
    // Redirect to the base URL without any query parameters
    // This will use the server's default sorting (popular)
    const url = new URL(window.location.origin + window.location.pathname);

    // Keep only non-default sort parameter
    const currentSort = new URL(window.location.href).searchParams.get("sort");
    if (currentSort && currentSort !== "popular") {
      url.searchParams.set("sort", currentSort);
    }

    window.location.href = url.toString();
  }

  setupImageLoading() {
    const images = document.querySelectorAll(".band-image");
    images.forEach((img) => {
      // If image is already loaded
      if (img.complete) {
        img.style.opacity = "1";
      } else {
        img.addEventListener("load", function () {
          this.style.opacity = "1";
        });
        img.style.opacity = "0";
        img.style.transition = "opacity 0.3s ease";
      }
    });
  }

  // Utility function to get flag emoji for country
  static getFlagEmoji(countryCode) {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  }
}

// Export for potential module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = BandList;
}
