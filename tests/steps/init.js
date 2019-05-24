'use strict';

const awscred = require('awscred');

let initialised = false;

let init = async function() {
  if (initialised) {
    return;
  }

  process.env.restaurants_api =
    'https://rqpsqbjlw7.execute-api.ap-southeast-2.amazonaws.com/dev/restaurants';
  process.env.restaurants_table = 'restaurants';
  process.env.AWS_REGION = 'ap-southeast-2';
  process.env.cognito_client_id = '69o22b6dfgt2s2cpa1t0kbbgv';
  process.env.cognito_user_pool_id = 'ap-southeast-2_pxs41rjSB';

  if (!process.env.AWS_ACCESS_KEY_ID) {
    let { credentials } = await new Promise(resolve =>
      awscred.load((err, data) => resolve(data))
    );

    process.env.AWS_ACCESS_KEY_ID = credentials.accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = credentials.secretAccessKey;
  }

  initialised = true;
};

module.exports.init = init;
