'use strict';

const expect = require('chai').expect;
const init = require('../steps/init').init;
const when = require('../steps/when');

describe(`When we invoke the POST /restaurants/search endpoint with theme 'cartoon'`, async () => {
  before(async function() {
    await init();
  });

  it(`Should return an array of 4 restaurants`, async () => {
    const res = await when.we_invoke_search_restaurants('cartoon');

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.lengthOf(4);

    for (const restaurant of res.body) {
      expect(restaurant).to.have.property('name');
      expect(restaurant).to.have.property('image');
    }
  });
});
