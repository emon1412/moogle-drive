import app from './server.js';
const serverless = require('serverless-http');

const options = {
  request: async function (request, event, context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }
};

export const handler = serverless(app, options);
