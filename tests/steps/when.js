'use strict';

const _ = require('lodash');
const axios = require('axios');
const aws4 = require('aws4');
const URL = require('url');
const mode = process.env.TEST_MODE;

const APP_ROOT = '../../';

const respondFrom = httpRes => {
  const contentType = _.get(
    httpRes,
    'headers.content-type',
    'application/json'
  );
  const body = contentType === 'application/json' ? httpRes.data : httpRes.data;

  return {
    statusCode: httpRes.status,
    body: body,
    headers: httpRes.headers,
  };
};

const signHttpRequest = (url, httpReq) => {
  const urlData = URL.parse(url);
  httpReq['host'] = urlData.hostname;
  httpReq['path'] = urlData.pathname;

  aws4.sign(httpReq);
};

let viaHttp = async (relPath, method, opts) => {
  const root = process.env.TEST_ROOT;
  const url = `${root}/${relPath}`;
  console.log(`invoking via HTTP ${method} ${url}`);

  try {
    let httpReq = {};
    httpReq['method'] = method;
    httpReq['url'] = url;
    if (opts != undefined && 'body' in opts) {
      httpReq['data'] = opts['body'];
    }

    const authHeader = _.get(opts, 'auth');
    if (authHeader) {
      httpReq = {
        ...httpReq,
        headers: {
          Authorization: authHeader,
        },
      };
    }

    if (_.get(opts, 'iam_auth', false) === true) {
      signHttpRequest(url, httpReq);
    }

    const res = await axios(httpReq);
    return respondFrom(res);
  } catch (err) {
    if (err.status) {
      return {
        statusCode: err.status,
        headers: err.response.headers,
      };
    } else {
      throw err;
    }
  }
};

const viaHandler = async (event, functionName) => {
  let handler = require(`${APP_ROOT}/functions/${functionName}`).handler;
  let context = {};

  let response = await handler(event, context);

  const contentType = _.get(
    response,
    'headers.content-type',
    'application/json'
  );

  if (response.body && contentType === 'application/json') {
    response.body = JSON.parse(response.body);
  }

  return response;
};

let we_invoke_get_index = async () => {
  const res =
    mode === 'handler'
      ? await viaHandler({}, 'get-index')
      : await viaHttp('', 'GET');

  return res;
};

let we_invoke_get_restaurants = async () => {
  let res =
    mode === 'handler'
      ? await viaHandler({}, 'get-restaurants')
      : await viaHttp('restaurants', 'GET', { iam_auth: true });

  return res;
};

let we_invoke_search_restaurants = async (user, theme) => {
  const body = JSON.stringify({ theme });
  const auth = user.idToken;
  const res =
    mode === 'handler'
      ? viaHandler({ body }, 'search-restaurants')
      : viaHttp('restaurants/search', 'POST', { body, auth });

  return res;
};

module.exports = {
  we_invoke_get_index,
  we_invoke_get_restaurants,
  we_invoke_search_restaurants,
};
