const { expect } = require('chai');

const { bankList, getBankLabel } = require('../../../src/helpers/bank');

describe('bank helper test', () => {
  describe('bankList', () => {
    it('should be a non empty list of banks', () => {
      expect(bankList).to.be.an('array');
      expect(bankList.length).to.be.above(0);
    });

    it('should expose a numeric code and a label for every bank', () => {
      bankList.forEach((bank) => {
        expect(bank.code).to.be.a('number');
        expect(Number.isInteger(bank.code)).to.equal(true);
        expect(bank.label).to.be.a('string');
        expect(bank.label).to.not.be.empty;
      });
    });

    it('should not contain duplicated bank codes', () => {
      const codes = bankList.map((bank) => bank.code);

      expect(new Set(codes).size).to.equal(codes.length);
    });

    it('should contain the most used indonesian banks', () => {
      const codes = bankList.map((bank) => bank.code);

      // BCA (14), Mandiri (8), BNI (9), BRI (2), BSI/BSM (451)
      [14, 8, 9, 2, 451].forEach((code) => {
        expect(codes).to.include(code);
      });
    });

    it('should pin the most used banks at the top by the sort column', () => {
      // BCA, Mandiri, BRI and BNI have the lowest sort values (1, 2, 3, 4).
      expect(bankList.slice(0, 4).map((bank) => bank.code)).to.deep.equal([14, 8, 2, 9]);
    });

    it('should order every sort value ascending', () => {
      const pinnedSorts = bankList
        .filter((bank) => bank.sort !== null)
        .map((bank) => bank.sort);

      expect(pinnedSorts).to.deep.equal([...pinnedSorts].sort((a, b) => a - b));
    });

    it('should list banks without a sort value after the pinned ones, by name', () => {
      const pinnedCount = bankList.filter((bank) => bank.sort !== null).length;
      const rest = bankList.slice(pinnedCount);
      const labels = rest.map((bank) => bank.label);

      expect(rest.every((bank) => bank.sort === null)).to.equal(true);
      expect(labels).to.deep.equal([...labels].sort((a, b) => a.localeCompare(b)));
    });

    it('should adopt the sort value declared on a duplicate bank code', () => {
      // "Digibank" (46) and "TMRW (UOB Indonesia)" (23) are duplicates of banks
      // declared earlier without a sort value.
      expect(bankList.find((bank) => bank.code === 46).sort).to.equal(11);
      expect(bankList.find((bank) => bank.code === 23).sort).to.equal(12);
    });
  });

  describe('getBankLabel', () => {
    it('should return the label of a known bank code', () => {
      expect(getBankLabel(8)).to.equal('Bank Mandiri');
      expect(getBankLabel('451')).to.equal('Bank Syariah Indonesia (BSM)');
    });

    it('should return an empty string when the bank is unknown', () => {
      expect(getBankLabel(99999)).to.equal('');
    });

    it('should return an empty string when the code is empty', () => {
      expect(getBankLabel('')).to.equal('');
      expect(getBankLabel(undefined)).to.equal('');
      expect(getBankLabel(null)).to.equal('');
    });
  });
});
