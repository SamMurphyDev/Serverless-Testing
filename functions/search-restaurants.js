'use strict';

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const defaultResults = process.env.defaultResults || 8;
const tableName = process.env.restaurants_table;

async function findRestaurantsByTheme(theme, count) {
  const req = {
    TableName: tableName,
    Limit: count,
    FilterExpression: 'contains(themes, :theme)',
    ExpressionAttributeValues: { ':theme': theme },
  };

  const resp = await dynamodb.scan(req).promise();
  return resp.Items;
}

exports.handler = async function(event, context) {
  const req = JSON.parse(event.body);
  const restaurants = await findRestaurantsByTheme(req.theme, defaultResults);
  return {
    statusCode: 200,
    body: JSON.stringify(restaurants),
  };
};
