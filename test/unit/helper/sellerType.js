const { expect } = require('chai');

const { normalizeSellerType } = require('../../../src/helpers/sellerType');
const { SELLER_TYPES } = require('../../../src/constant');

describe('seller type helper test', () => {
  describe('normalizeSellerType', () => {
    it('should accept every seller type of the form', () => {
      SELLER_TYPES.forEach((sellerType) => {
        expect(normalizeSellerType(sellerType)).to.equal(sellerType);
      });
    });

    it('should uppercase the seller type', () => {
      expect(normalizeSellerType('shop')).to.equal('SHOP');
      expect(normalizeSellerType('Official')).to.equal('OFFICIAL');
    });

    it('should trim the surrounding spaces', () => {
      expect(normalizeSellerType('  collector  ')).to.equal('COLLECTOR');
    });

    it('should return an empty string for an unknown seller type', () => {
      expect(normalizeSellerType('reseller')).to.equal('');
    });

    it('should return an empty string when the type is empty', () => {
      expect(normalizeSellerType('')).to.equal('');
      expect(normalizeSellerType(undefined)).to.equal('');
      expect(normalizeSellerType(null)).to.equal('');
    });
  });
});
