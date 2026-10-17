/**
 * Banks that can be used as a seller payout account.
 *
 * The list is loaded from `src/data/bank-codes-indonesian.csv`
 * (`no,name,code,sort`). `code` is the numeric Kode Bank Indonesia stored in the
 * database (sellers.sel_bank_code) and `label` is the bank name shown to the
 * seller. `sort` pins the most popular banks to the top of the dropdown.
 *
 * The final list is ordered by `sort` ascending (banks without a `sort` value
 * are listed afterwards) and then by bank name. When a code appears more than
 * once the first name wins, so the list never contains duplicated codes.
 */
const fs = require('fs');
const path = require('path');

const BANK_CSV_PATH = path.join(__dirname, '..', 'data', 'bank-codes-indonesian.csv');

/**
 * Split a CSV line into its fields. Values wrapped in double quotes are kept as
 * a single field so names containing commas ("Bank of America, N.A") are parsed
 * correctly. Surrounding quotes are removed and every field is trimmed.
 *
 * @param {string} line raw CSV line
 * @returns {string[]} the line fields
 */
const splitCsvLine = (line) => {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current.trim());

  return fields;
};

/**
 * Parse the bank CSV (`no,name,code,sort`).
 *
 * @param {string} content raw CSV content
 * @returns {Array<{code: number, label: string, sort: number|null}>} parsed rows
 */
const parseBankCsv = (content) => {
  const rows = [];
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/);

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || index === 0) {
      return;
    }

    const fields = splitCsvLine(trimmed);
    if (fields.length < 3) {
      return;
    }

    const label = fields[1];
    const code = parseInt(fields[2], 10);
    const sortValue = parseInt(fields[3], 10);

    if (!label || Number.isNaN(code)) {
      return;
    }

    rows.push({
      code,
      label,
      sort: Number.isNaN(sortValue) ? null : sortValue,
    });
  });

  return rows;
};

// Keep a single entry per bank code. The first name found in the CSV wins, but a
// `sort` value declared on a later duplicate (e.g. "Digibank" for code 46) is
// still adopted so the popular banks stay pinned to the top.
const seenCodes = new Map();
const bankList = [];

parseBankCsv(fs.readFileSync(BANK_CSV_PATH, 'utf-8')).forEach((bank) => {
  const existing = seenCodes.get(bank.code);

  if (existing) {
    if (existing.sort === null && bank.sort !== null) {
      existing.sort = bank.sort;
    }

    return;
  }

  seenCodes.set(bank.code, bank);
  bankList.push(bank);
});

// Order the list by `sort` (banks without a value go last) and then by name.
bankList.sort((a, b) => {
  const sortA = a.sort === null ? Number.POSITIVE_INFINITY : a.sort;
  const sortB = b.sort === null ? Number.POSITIVE_INFINITY : b.sort;

  if (sortA !== sortB) {
    return sortA - sortB;
  }

  return a.label.localeCompare(b.label);
});

/**
 * Human readable label of a stored bank code.
 *
 * @param {number|string} code bank code stored on the seller
 * @returns {string} bank label, or an empty string when it is not in the list
 */
const getBankLabel = (code) => {
  const bank = bankList.find((item) => item.code === Number(code));

  return bank ? bank.label : '';
};

module.exports = { bankList, getBankLabel };
