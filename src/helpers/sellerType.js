const { SELLER_TYPES } = require('../constant');

/**
 * Normalize a seller type coming from a query string (or a request body) into
 * one of the values accepted by the seller form.
 *
 * The landing page links to the registration / seller form with
 * `?sel_type=COLLECTOR|SHOP|OFFICIAL`, so the value has to be validated before
 * it is used to prefill the "Tipe Seller" select.
 *
 * Any unknown value returns an empty string so the caller can keep its own
 * default.
 *
 * @param {string} value raw seller type, in any case (e.g. "shop" or "OFFICIAL")
 * @returns {string} seller type in SELLER_TYPES format, or '' when unknown
 */
const normalizeSellerType = (value) => {
  const type = (value || '').toString().trim().toUpperCase();

  return SELLER_TYPES.includes(type) ? type : '';
};

module.exports = { normalizeSellerType };
