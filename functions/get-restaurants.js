'use strict';

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const defaultResults = process.env.defaultResults || 8;
const tableName = process.env.restaurants_table;

async function getRestaurants(count) {
  const req = {
    TableName: tableName,
    Limit: count,
  };

  const resp = await dynamodb.scan(req).promise();
  return resp.Items;
}

exports.handler = async function(event, context) {
  const restaurants = await getRestaurants(defaultResults);
  return {
    statusCode: 200,
    body: JSON.stringify(restaurants),
  };
};
