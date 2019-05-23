'use strict';

const fs = require('fs');
const mustache = require('mustache');
const axios = require('axios');
const aws4 = require('aws4');
const URL = require('url');

const awsRegion = process.env.region;
const cognitoUserPoolId = process.env.cognito_user_pool_id;
const cognitoClientId = process.env.cognito_client_id;
const restaurantsApiRoot = process.env.restaurants_api;

let html;

async function loadHtml() {
  if (!html) {
    html = await fs.readFileSync('static/index.html', 'utf-8');
  }

  return html;
}

async function getRestaurants() {
  const url = URL.parse(restaurantsApiRoot);
  const request = {
    host: url.hostname,
    path: url.pathname,
    url: restaurantsApiRoot,
    method: 'GET',
  };

  if (!process.env.AWS_ACCESS_KEY_ID) {
    const { credentials } = await awscred.load();

    process.env.AWS_ACCESS_KEY_ID = credentials.AWS_ACCESS_KEY_ID;
    process.env.AWS_SECRET_ACCESS_KEY = credentials.AWS_SECRET_ACCESS_KEY;
  }

  let signedRequest = aws4.sign(request);

  delete signedRequest.headers['Host'];
  delete signedRequest.headers['Content-Length'];

  if (!signedRequest.headers['X-Amz-Security-Token']) {
    delete signedRequest.headers['X-Amz-Security-Token'];
  }

  const { data } = await axios(signedRequest);
  return data;
}

exports.handler = async function(event, context) {
  const template = await loadHtml();
  const restaurants = await getRestaurants();
  const view = {
    restaurants,
    awsRegion,
    cognitoUserPoolId,
    cognitoClientId,
    searchUrl: `${restaurantsApiRoot}/search`,
  };
  const html = mustache.render(template, view);

  return {
    statusCode: 200,
    body: html,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
    },
  };
};
