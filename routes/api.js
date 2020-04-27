/*
*
*
*       Complete the API routing below
*
*
*/

/* [Stock Price Checker API]

  Since all reliable stock price APIs require an API key, 
  we've built a workaround. Use https://repeated-alpaca.glitch.me/ 
  to get up-to-date stock price information without needing 
  to sign up for your own key.

Usage:
  GET https://repeated-alpaca.glitch.me/v1/stock/[symbol]/quote

Where:
  symbol = msft | goog | aapl | ...

*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      
    });
    
};
