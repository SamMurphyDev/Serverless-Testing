'use strict';

const AWS = require('aws-sdk');
AWS.config.region = 'ap-southeast-2';
const cognito = new AWS.CognitoIdentityServiceProvider();

const an_authenticated_user = async user => {
  const req = {
    UserPoolId: process.env.cognito_user_pool_id,
    Username: user.username,
  };
  await cognito.adminDeleteUser(req).promise();
};

module.exports = {
  an_authenticated_user,
};
