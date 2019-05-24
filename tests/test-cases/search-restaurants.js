'use strict';

const expect = require('chai').expect;
const init = require('../steps/init').init;
const when = require('../steps/when');
const given = require('../steps/given');
const teardown = require('../steps/teardown');

describe('Given an authenticated user', async () => {
  let user;
  before(async () => {
    await init();
    user = await given.an_authenticated_user();
  });

  // after(async () => {
  //   await teardown.an_authenticated_user(user);
  // });

  describe(`When we invoke the POST /restaurants/search endpoint with theme 'cartoon'`, async () => {
    it(`Should return an array of 4 restaurants`, async () => {
      const res = await when.we_invoke_search_restaurants(user, 'cartoon');

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.lengthOf(4);

      for (const restaurant of res.body) {
        expect(restaurant).to.have.property('name');
        expect(restaurant).to.have.property('image');
      }
    });
  });
});
