const { expect } = require('chai');

const { sellerSchema } = require('../../../src/models/schema');
const { SELLER_TYPES } = require('../../../src/constant');

const options = { abortEarly: false, allowUnknown: true, stripUnknown: true };

const basePayload = {
  sel_type: 'COLLECTOR',
  name: 'Distro Suara Keras',
  hp: '081234567890',
  bank_code: 14,
  bank_account_number: '1234567890',
  bank_account_name: 'Budi Santoso',
};

const validate = (payload) => sellerSchema.validate(payload, options);

const messagesOf = (error) => error.details.map((detail) => detail.message);

describe('seller schema bank account test', () => {
  it('should accept a valid bank account payload', () => {
    const { error, value } = validate(basePayload);

    expect(error).to.be.undefined;
    expect(value.bank_code).to.equal(14);
    expect(value.bank_account_number).to.equal('1234567890');
    expect(value.bank_account_name).to.equal('Budi Santoso');
  });

  it('should accept a bank code coming from the bank list', () => {
    // 213 = Bank BTPN (Bank Tabungan Pensiunan Nasional)
    const { error, value } = validate({ ...basePayload, bank_code: 213 });

    expect(error).to.be.undefined;
    expect(value.bank_code).to.equal(213);
  });

  it('should reject a bank code outside of the bank list', () => {
    const { error } = validate({ ...basePayload, bank_code: 99999 });

    expect(error).to.not.be.undefined;
    expect(messagesOf(error)).to.include('Nama bank wajib dipilih dari daftar bank yang tersedia');
  });

  it('should accept an empty bank code', () => {
    const { error, value } = validate({ ...basePayload, bank_code: '' });

    expect(error).to.be.undefined;
    expect(value.bank_code).to.equal('');
  });

  it('should accept missing bank account fields', () => {
    const { error } = validate({
      sel_type: basePayload.sel_type,
      name: basePayload.name,
      hp: basePayload.hp,
    });

    expect(error).to.be.undefined;
  });

  it('should accept empty bank account number and name', () => {
    const { error } = validate({ ...basePayload, bank_account_number: '', bank_account_name: '' });

    expect(error).to.be.undefined;
  });

  it('should reject a bank account number that is too short', () => {
    const { error } = validate({ ...basePayload, bank_account_number: '123' });

    expect(error).to.not.be.undefined;
    expect(messagesOf(error)).to.include('Nomor rekening harus berupa 6-20 digit angka');
  });

  it('should reject a bank account number containing letters', () => {
    const { error } = validate({ ...basePayload, bank_account_number: '12ab34' });

    expect(error).to.not.be.undefined;
    expect(messagesOf(error)).to.include('Nomor rekening harus berupa 6-20 digit angka');
  });

  it('should reject a bank account name that is too short', () => {
    const { error } = validate({ ...basePayload, bank_account_name: 'Ab' });

    expect(error).to.not.be.undefined;
    expect(messagesOf(error)).to.include('Nama pemilik rekening minimal 3 karakter');
  });

  it('should reject a bank account name longer than 100 characters', () => {
    const { error } = validate({ ...basePayload, bank_account_name: 'a'.repeat(101) });

    expect(error).to.not.be.undefined;
    expect(messagesOf(error)).to.include('Nama pemilik rekening maksimal 100 karakter');
  });
});

describe('seller schema seller type test', () => {
  it('should accept every seller type of the list', () => {
    SELLER_TYPES.forEach((sellerType) => {
      const { error, value } = validate({ ...basePayload, sel_type: sellerType });

      expect(error).to.be.undefined;
      expect(value.sel_type).to.equal(sellerType);
    });
  });

  it('should reject a seller type outside of the list', () => {
    const { error } = validate({ ...basePayload, sel_type: 'RESELLER' });

    expect(error).to.not.be.undefined;
    expect(messagesOf(error)).to.include('Tipe seller wajib dipilih dari daftar yang tersedia');
  });

  it('should reject an empty seller type', () => {
    const { error } = validate({ ...basePayload, sel_type: '' });

    expect(error).to.not.be.undefined;
    expect(messagesOf(error)).to.include('Tipe seller wajib dipilih dari daftar yang tersedia');
  });

  it('should reject a missing seller type', () => {
    const { error } = validate({ ...basePayload, sel_type: undefined });

    expect(error).to.not.be.undefined;
    expect(messagesOf(error)).to.include('Tipe seller wajib dipilih');
  });
});
