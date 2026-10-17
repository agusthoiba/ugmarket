const path = require('path');
const { expect } = require('chai');
const ejs = require('ejs');

const content = require('../../../src/data/content');
const { SELLER_TYPES } = require('../../../src/constant');

const PARTIAL_PATH = path.join(__dirname, '../../../views/front/landing/partials/sections/sellerTypes.ejs');

const renderPartial = (data) =>
  new Promise((resolve, reject) => {
    ejs.renderFile(PARTIAL_PATH, { data }, {}, (err, str) => {
      if (err) {
        return reject(err);
      }

      return resolve(str);
    });
  });

const renderSection = (registerUrl) =>
  renderPartial({ sellerTypes: content.sellerTypes, registerUrl });

describe('landing seller types view test', () => {
  it('should render a registration link for every seller type', async () => {
    const html = await renderSection('/auth/register');

    content.sellerTypes.forEach((sellerType) => {
      expect(html).to.include(`data-testid="type-cta-${sellerType.id}"`);
    });
  });

  it('should send the seller type of the card as sel_type query', async () => {
    const html = await renderSection('/auth/register');

    content.sellerTypes.forEach((sellerType) => {
      expect(html).to.include(`href="/auth/register?sel_type=${sellerType.selType}"`);
    });
  });

  it('should keep the sel_type query when the visitor is already logged in', async () => {
    const html = await renderSection('/account/seller');

    content.sellerTypes.forEach((sellerType) => {
      expect(html).to.include(`href="/account/seller?sel_type=${sellerType.selType}"`);
    });
  });

  it('should only send seller types accepted by the seller form', async () => {
    const html = await renderSection('/auth/register');
    const types = html.match(/sel_type=[A-Z]+/g) || [];

    expect(types.length).to.equal(content.sellerTypes.length);
    types.forEach((type) => {
      expect(SELLER_TYPES).to.include(type.replace('sel_type=', ''));
    });
  });

  it('should map every card to a distinct seller type of the seller form', () => {
    const selTypes = content.sellerTypes.map((sellerType) => sellerType.selType);

    expect(new Set(selTypes).size).to.equal(selTypes.length);
    selTypes.forEach((selType) => {
      expect(SELLER_TYPES).to.include(selType);
    });
  });
});
