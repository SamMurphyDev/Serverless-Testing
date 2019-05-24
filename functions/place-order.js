'use strict';

const AWS = require('aws-sdk');
const kinesis = new AWS.Kinesis();
const chance = require('chance').Chance();
const jwtDecode = require('jwt-decode');
const streamName = process.env.order_event_stream;

exports.handler = async (event, context) => {
  const restaurantName = event.restaurantName;
  const { email } = jwtDecode(event.idToken);
  const orderId = chance.guid();

  let data = {
    orderId,
    email,
    restaurantName,
    eventType: 'order_placed',
  };

  const putReq = {
    Data: JSON.stringify(data),
    PartitionKey: orderId,
    StreamName: streamName,
  };
  console.log(putReq);
  await kinesis.putRecord(putReq).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ orderId }),
  };
};
