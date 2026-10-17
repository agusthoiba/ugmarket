const { expect } = require('chai');

const { formatPhone } = require('../../../src/helpers/phone');

describe('phone helper test', () => {
  describe('formatPhone', () => {
    it('should keep phone number with "+62" prefix as is', () => {
      expect(formatPhone('+628123456789')).to.equal('+628123456789');
    });

    it('should convert phone number with "0" prefix to "+62"', () => {
      expect(formatPhone('08123456789')).to.equal('+628123456789');
    });

    it('should convert phone number with "62" prefix to "+62"', () => {
      expect(formatPhone('628123456789')).to.equal('+628123456789');
    });

    it('should trim the phone number before formatting', () => {
      expect(formatPhone('  08123456789  ')).to.equal('+628123456789');
    });

    it('should return empty string when phone number is empty', () => {
      expect(formatPhone('')).to.equal('');
      expect(formatPhone('   ')).to.equal('');
      expect(formatPhone(undefined)).to.equal('');
      expect(formatPhone(null)).to.equal('');
    });
  });
});
