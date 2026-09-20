/**
 * Normalize an Indonesian phone number so every number is stored with a single
 * "+62" prefix format.
 *
 * Handled cases:
 * - prefix "+62" -> kept as is        (+6281234567890 -> +6281234567890)
 * - prefix "0"   -> converted to +62  (081234567890   -> +6281234567890)
 * - prefix "62"  -> prefixed by +     (6281234567890  -> +6281234567890)
 *
 * Any other value is treated as a local number without prefix and gets "+62"
 * prepended. Empty value returns an empty string.
 *
 * @param {string} phone raw phone number coming from the request body
 * @returns {string} phone number with "+62" prefix
 */
const formatPhone = (phone) => {
  const value = (phone || '').trim();

  if (!value) {
    return '';
  }

  if (value.startsWith('+62')) {
    return value;
  }

  if (value.startsWith('0')) {
    return '+62' + value.substring(1);
  }

  if (value.startsWith('62')) {
    return '+' + value;
  }

  return '+62' + value;
};

module.exports = { formatPhone };
