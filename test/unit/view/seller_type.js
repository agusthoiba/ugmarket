const path = require('path');
const { expect } = require('chai');
const ejs = require('ejs');

const { SELLER_TYPES } = require('../../../src/constant');

const PARTIAL_PATH = path.join(__dirname, '../../../views/front/account/seller_type.html');

const renderPartial = (seller) =>
  new Promise((resolve, reject) => {
    ejs.renderFile(PARTIAL_PATH, { data: { sellerTypes: SELLER_TYPES, seller } }, {}, (err, str) => {
      if (err) {
        return reject(err);
      }

      return resolve(str);
    });
  });

describe('seller type form view test', () => {
  it('should render the seller type select', async () => {
    const html = await renderPartial({ sel_type: '' });

    expect(html).to.include('id="sel_type"');
    expect(html).to.include('name="sel_type"');
  });

  it('should render a placeholder plus every seller type of the list', async () => {
    const html = await renderPartial({ sel_type: '' });
    const options = html.match(/<option /g) || [];

    expect(options.length).to.equal(SELLER_TYPES.length + 1);
    expect(html).to.include('Pilih tipe seller...');
    SELLER_TYPES.forEach((sellerType) => {
      expect(html).to.include(`<option value="${sellerType}"`);
    });
  });

  it('should render a readable label for every seller type', async () => {
    const html = await renderPartial({ sel_type: '' });

    expect(html).to.include('>Collector</option>');
    expect(html).to.include('>Shop</option>');
    expect(html).to.include('>Official</option>');
  });

  it('should pre select the seller type saved on the seller', async () => {
    const html = await renderPartial({ sel_type: 'OFFICIAL' });

    expect(html).to.include('<option value="OFFICIAL" selected>');
  });

  it('should not pre select any seller type when the seller has no type yet', async () => {
    const html = await renderPartial({ sel_type: '' });

    expect(html).to.not.include('selected');
  });

  it('should render an error container next to the select', async () => {
    const html = await renderPartial({ sel_type: '' });

    expect(html.match(/invalid-feedback/g).length).to.equal(1);
  });

  it('should keep the select editable while the seller does not exist yet', async () => {
    const html = await renderPartial({ id: 0, sel_type: '' });

    expect(html).to.not.include('disabled');
  });

  it('should disable the select once the seller already exists', async () => {
    const html = await renderPartial({ id: 12, sel_type: 'SHOP' });

    expect(html).to.include('id="sel_type" name="sel_type" required disabled');
    expect(html).to.include('<option value="SHOP" selected>');
  });

  it('should hide the disabled notice while creating the seller', async () => {
    const html = await renderPartial({ id: 0, sel_type: '' });

    expect(html).to.not.include('Tipe seller tidak dapat diubah setelah lapak dibuat.');
  });
});
