const path = require('path');
const { expect } = require('chai');
const ejs = require('ejs');

const { bankList } = require('../../../src/helpers/bank');

const PARTIAL_PATH = path.join(__dirname, '../../../views/front/account/seller_bank.html');

const renderPartial = (seller) =>
  new Promise((resolve, reject) => {
    ejs.renderFile(PARTIAL_PATH, { data: { banks: bankList, seller } }, {}, (err, str) => {
      if (err) {
        return reject(err);
      }

      return resolve(str);
    });
  });

const emptySeller = {
  sel_bank_code: '',
  sel_bank_account_number: '',
  sel_bank_account_name: '',
};

describe('seller bank form view test', () => {
  it('should render the bank account inputs', async () => {
    const html = await renderPartial(emptySeller);

    expect(html).to.include('id="bank_code"');
    expect(html).to.include('name="bank_code"');
    expect(html).to.include('id="bank_account_number"');
    expect(html).to.include('name="bank_account_number"');
    expect(html).to.include('id="bank_account_name"');
    expect(html).to.include('name="bank_account_name"');
  });

  it('should render a placeholder plus every bank of the list', async () => {
    const html = await renderPartial(emptySeller);
    const options = html.match(/<option /g) || [];

    expect(options.length).to.equal(bankList.length + 1);
    expect(html).to.include('Pilih bank...');
    bankList.forEach((bank) => {
      expect(html).to.include(`<option value="${bank.code}"`);
      expect(html).to.include(bank.label);
    });
  });

  it('should pre select the bank saved on the seller', async () => {
    // 542 = Bank Jago (Bank Artos Indonesia)
    const html = await renderPartial({ ...emptySeller, sel_bank_code: 542 });

    expect(html).to.include('<option value="542" selected>');
    expect(html).to.include('Bank Jago');
  });

  it('should prefill the saved account number and account name', async () => {
    const html = await renderPartial({
      sel_bank_code: 14,
      sel_bank_account_number: '9988776655',
      sel_bank_account_name: 'Distro Suara Keras',
    });

    expect(html).to.include('value="9988776655"');
    expect(html).to.include('value="Distro Suara Keras"');
  });

  it('should not pre select any bank when the seller has no bank yet', async () => {
    const html = await renderPartial(emptySeller);

    expect(html).to.not.include('selected');
  });

  it('should render an error container next to every input', async () => {
    const html = await renderPartial(emptySeller);

    expect(html.match(/invalid-feedback/g).length).to.equal(3);
  });

  it('should render the bank account fields as optional', async () => {
    const html = await renderPartial(emptySeller);

    // No HTML5 required attribute and no mandatory marker in the labels.
    expect(html).to.not.match(/required/);
    expect(html).to.not.include('text-danger');
    expect(html.match(/\(opsional\)/g).length).to.equal(3);
  });
});
