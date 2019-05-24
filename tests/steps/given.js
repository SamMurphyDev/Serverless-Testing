'use strict';

const AWS = require('aws-sdk');
AWS.config.region = 'ap-southeast-2';
const cognito = new AWS.CognitoIdentityServiceProvider();
const chance = require('chance').Chance();

const random_password = () => {
  // needs number, special char, upper and lower case
  return `${chance.string({ length: 8 })}B!gM0uth`;
};

const an_authenticated_user = async () => {
  const userpoolId = process.env.cognito_user_pool_id;
  const clientId = process.env.cognito_client_id;

  const firstName = chance.first();
  const lastName = chance.last();
  const username = `test-${firstName}-${lastName}`;
  const password = random_password();
  const email = `${firstName}-${lastName}@big-mouth.com`;

  const createReq = {
    UserPoolId: userpoolId,
    Username: username,
    MessageAction: 'SUPPRESS',
    TemporaryPassword: password,
    UserAttributes: [
      { Name: 'given_name', Value: firstName },
      { Name: 'family_name', Value: lastName },
      { Name: 'email', Value: email },
    ],
  };
  await cognito.adminCreateUser(createReq).promise();

  const req = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    UserPoolId: userpoolId,
    ClientId: clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };
  const resp = await cognito.adminInitiateAuth(req).promise();

  const challengeReq = {
    UserPoolId: userpoolId,
    ClientId: clientId,
    ChallengeName: resp.ChallengeName,
    Session: resp.Session,
    ChallengeResponses: {
      USERNAME: username,
      NEW_PASSWORD: random_password(),
    },
  };
  const challengeResp = await cognito
    .adminRespondToAuthChallenge(challengeReq)
    .promise();

  return {
    username,
    firstName,
    lastName,
    idToken: challengeResp.AuthenticationResult.IdToken,
  };
};

module.exports = {
  an_authenticated_user,
};
