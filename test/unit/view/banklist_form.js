const path = require('path');
const { expect } = require('chai');
const ejs = require('ejs');

const { bankList } = require('../../../src/helpers/bank');

const PARTIAL_PATH = path.join(__dirname, '../../../views/front/banklist_form.html');

const renderPartial = () =>
  new Promise((resolve, reject) => {
    ejs.renderFile(PARTIAL_PATH, { data: { banks: bankList } }, {}, (err, str) => {
      if (err) {
        return reject(err);
      }

      return resolve(str);
    });
  });

describe('banklist form view test', () => {
  it('should render a placeholder plus every bank of the list', async () => {
    const html = await renderPartial();
    const options = html.match(/<option /g) || [];

    expect(options.length).to.equal(bankList.length + 1);
    expect(html).to.include('Pilih bank...');
    bankList.forEach((bank) => {
      expect(html).to.include(`<option value="${bank.code}"`);
      expect(html).to.include(bank.label);
    });
  });

  it('should not hardcode any bank option', async () => {
    const html = await renderPartial();

    expect(html).to.not.include('value="BCA"');
  });
});
