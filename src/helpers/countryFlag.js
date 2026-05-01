/**
 * Country Flag Helper
 * Provides utility functions for getting flag emojis for countries
 */

/**
 * Get flag emoji for a country name
 * @param {string} countryName - Name of the country
 * @returns {string} Flag emoji or default flag if not found
 */
function getCountryFlag(countryName) {
  if (!countryName) return "🏴";

  const country = countryName.toLowerCase();
  const flagMap = {
    usa: "🇺🇸",
    "united states": "🇺🇸",
    us: "🇺🇸",
    uk: "🇬🇧",
    "united kingdom": "🇬🇧",
    "great britain": "🇬🇧",
    england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    germany: "🇩🇪",
    france: "🇫🇷",
    italy: "🇮🇹",
    spain: "🇪🇸",
    sweden: "🇸🇪",
    norway: "🇳🇴",
    finland: "🇫🇮",
    denmark: "🇩🇰",
    netherlands: "🇳🇱",
    belgium: "🇧🇪",
    austria: "🇦🇹",
    switzerland: "🇨🇭",
    poland: "🇵🇱",
    "czech republic": "🇨🇿",
    slovakia: "🇸🇰",
    hungary: "🇭🇺",
    romania: "🇷🇴",
    bulgaria: "🇧🇬",
    greece: "🇬🇷",
    turkey: "🇹🇷",
    russia: "🇷🇺",
    ukraine: "🇺🇦",
    japan: "🇯🇵",
    china: "🇨🇳",
    "south korea": "🇰🇷",
    australia: "🇦🇺",
    canada: "🇨🇦",
    brazil: "🇧🇷",
    argentina: "🇦🇷",
    mexico: "🇲🇽",
    india: "🇮🇳",
    indonesia: "🇮🇩",
    malaysia: "🇲🇾",
    philippines: "🇵🇭",
    thailand: "🇹🇭",
    vietnam: "🇻🇳",
    singapore: "🇸🇬",
    israel: "🇮🇱",
    egypt: "🇪🇬",
    "south africa": "🇿🇦",
    nigeria: "🇳🇬",
    kenya: "🇰🇪",
    ethiopia: "🇪🇹",
    morocco: "🇲🇦",
    algeria: "🇩🇿",
    tunisia: "🇹🇳",
    libya: "🇱🇾",
    sudan: "🇸🇩",
    iran: "🇮🇷",
    iraq: "🇮🇶",
    "saudi arabia": "🇸🇦",
    uae: "🇦🇪",
    qatar: "🇶🇦",
    kuwait: "🇰🇼",
    oman: "🇴🇲",
    yemen: "🇾🇪",
    jordan: "🇯🇴",
    lebanon: "🇱🇧",
    syria: "🇸🇾",
    pakistan: "🇵🇰",
    bangladesh: "🇧🇩",
    "sri lanka": "🇱🇰",
    nepal: "🇳🇵",
    bhutan: "🇧🇹",
    myanmar: "🇲🇲",
    cambodia: "🇰🇭",
    laos: "🇱🇦",
    mongolia: "🇲🇳",
    kazakhstan: "🇰🇿",
    uzbekistan: "🇺🇿",
    turkmenistan: "🇹🇲",
    kyrgyzstan: "🇰🇬",
    tajikistan: "🇹🇯",
    afghanistan: "🇦🇫",
    "new zealand": "🇳🇿",
    fiji: "🇫🇯",
    "papua new guinea": "🇵🇬",
    samoa: "🇼🇸",
    tonga: "🇹🇴",
    vanuatu: "🇻🇺",
    "solomon islands": "🇸🇧",
    kiribati: "🇰🇮",
    "marshall islands": "🇲🇭",
    micronesia: "🇫🇲",
    palau: "🇵🇼",
    nauru: "🇳🇷",
    tuvalu: "🇹🇻",
    cuba: "🇨🇺",
    jamaica: "🇯🇲",
    haiti: "🇭🇹",
    "dominican republic": "🇩🇴",
    "puerto rico": "🇵🇷",
    bahamas: "🇧🇸",
    barbados: "🇧🇧",
    "trinidad and tobago": "🇹🇹",
    guyana: "🇬🇾",
    suriname: "🇸🇷",
    "french guiana": "🇬🇫",
    venezuela: "🇻🇪",
    colombia: "🇨🇴",
    ecuador: "🇪🇨",
    peru: "🇵🇪",
    bolivia: "🇧🇴",
    chile: "🇨🇱",
    paraguay: "🇵🇾",
    uruguay: "🇺🇾",
    "costa rica": "🇨🇷",
    panama: "🇵🇦",
    nicaragua: "🇳🇮",
    honduras: "🇭🇳",
    "el salvador": "🇸🇻",
    guatemala: "🇬🇹",
    belize: "🇧🇿",
    portugal: "🇵🇹",
    ireland: "🇮🇪",
    iceland: "🇮🇸",
    greenland: "🇬🇱",
    "faroe islands": "🇫🇴",
    estonia: "🇪🇪",
    latvia: "🇱🇻",
    lithuania: "🇱🇹",
    belarus: "🇧🇾",
    moldova: "🇲🇩",
    georgia: "🇬🇪",
    armenia: "🇦🇲",
    azerbaijan: "🇦🇿",
    cyprus: "🇨🇾",
    malta: "🇲🇹",
    luxembourg: "🇱🇺",
    monaco: "🇲🇨",
    liechtenstein: "🇱🇮",
    "san marino": "🇸🇲",
    "vatican city": "🇻🇦",
    andorra: "🇦🇩",
    albania: "🇦🇱",
    bosnia: "🇧🇦",
    croatia: "🇭🇷",
    serbia: "🇷🇸",
    montenegro: "🇲🇪",
    macedonia: "🇲🇰",
    slovenia: "🇸🇮",
    kosovo: "🇽🇰",
  };

  // Check for exact match
  if (flagMap[country]) {
    return flagMap[country];
  }

  // Check for partial match
  for (const [key, flag] of Object.entries(flagMap)) {
    if (country.includes(key) || key.includes(country)) {
      return flag;
    }
  }

  // Default flag
  return "🏴";
}

/**
 * Get all supported countries and their flags
 * @returns {Object} Object with country names as keys and flag emojis as values
 */
function getAllCountryFlags() {
  return {
    usa: "🇺🇸",
    uk: "🇬🇧",
    germany: "🇩🇪",
    france: "🇫🇷",
    italy: "🇮🇹",
    spain: "🇪🇸",
    sweden: "🇸🇪",
    norway: "🇳🇴",
    finland: "🇫🇮",
    japan: "🇯🇵",
    china: "🇨🇳",
    australia: "🇦🇺",
    canada: "🇨🇦",
    brazil: "🇧🇷",
    russia: "🇷🇺",
    india: "🇮🇳",
    "south korea": "🇰🇷",
    mexico: "🇲🇽",
    indonesia: "🇮🇩",
    netherlands: "🇳🇱",
    turkey: "🇹🇷",
    "saudi arabia": "🇸🇦",
    switzerland: "🇨🇭",
    poland: "🇵🇱",
    argentina: "🇦🇷",
    belgium: "🇧🇪",
    "czech republic": "🇨🇿",
    thailand: "🇹🇭",
    iran: "🇮🇷",
    austria: "🇦🇹",
    uae: "🇦🇪",
    colombia: "🇨🇴",
    "south africa": "🇿🇦",
    denmark: "🇩🇰",
    malaysia: "🇲🇾",
    singapore: "🇸🇬",
    israel: "🇮🇱",
    egypt: "🇪🇬",
    philippines: "🇵🇭",
    finland: "🇫🇮",
    chile: "🇨🇱",
    pakistan: "🇵🇰",
    ireland: "🇮🇪",
    greece: "🇬🇷",
    portugal: "🇵🇹",
    iraq: "🇮🇶",
    kazakhstan: "🇰🇿",
    algeria: "🇩🇿",
    qatar: "🇶🇦",
    "new zealand": "🇳🇿",
    hungary: "🇭🇺",
    ukraine: "🇺🇦",
    peru: "🇵🇪",
    angola: "🇦🇴",
    romania: "🇷🇴",
    kuwait: "🇰🇼",
  };
}

/**
 * Check if a country is supported
 * @param {string} countryName - Name of the country
 * @returns {boolean} True if country is supported
 */
function isCountrySupported(countryName) {
  if (!countryName) return false;
  const country = countryName.toLowerCase();
  const flagMap = getAllCountryFlags();

  // Check for exact match
  if (flagMap[country]) {
    return true;
  }

  // Check for partial match
  for (const key of Object.keys(flagMap)) {
    if (country.includes(key) || key.includes(country)) {
      return true;
    }
  }

  return false;
}

/**
 * Get country name from country code (ISO 3166-1 alpha-2)
 * @param {string} countryCode - Two-letter country code
 * @returns {string} Country name or code if not found
 */
function getCountryNameFromCode(countryCode) {
  if (!countryCode || countryCode.length !== 2) return countryCode;

  const codeMap = {
    us: "United States",
    gb: "United Kingdom",
    de: "Germany",
    fr: "France",
    it: "Italy",
    es: "Spain",
    se: "Sweden",
    no: "Norway",
    fi: "Finland",
    jp: "Japan",
    cn: "China",
    au: "Australia",
    ca: "Canada",
    br: "Brazil",
    ru: "Russia",
    in: "India",
    kr: "South Korea",
    mx: "Mexico",
    id: "Indonesia",
    nl: "Netherlands",
    tr: "Turkey",
    sa: "Saudi Arabia",
    ch: "Switzerland",
    pl: "Poland",
    ar: "Argentina",
    be: "Belgium",
    cz: "Czech Republic",
    th: "Thailand",
    ir: "Iran",
    at: "Austria",
    ae: "United Arab Emirates",
    co: "Colombia",
    za: "South Africa",
    dk: "Denmark",
    my: "Malaysia",
    sg: "Singapore",
    il: "Israel",
    eg: "Egypt",
    ph: "Philippines",
    cl: "Chile",
    pk: "Pakistan",
    ie: "Ireland",
    gr: "Greece",
    pt: "Portugal",
    iq: "Iraq",
    kz: "Kazakhstan",
    dz: "Algeria",
    qa: "Qatar",
    nz: "New Zealand",
    hu: "Hungary",
    ua: "Ukraine",
    pe: "Peru",
    ao: "Angola",
    ro: "Romania",
    kw: "Kuwait",
  };

  return codeMap[countryCode.toLowerCase()] || countryCode.toUpperCase();
}

module.exports = {
  getCountryFlag,
  getAllCountryFlags,
  isCountrySupported,
  getCountryNameFromCode,
};
