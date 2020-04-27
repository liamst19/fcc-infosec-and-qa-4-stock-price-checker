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

var expect       = require('chai').expect;
var MongoClient  = require('mongodb');
var axios        = require('axios');

//const CONNECTION_STRING = process.env.DB; 
//MongoClient.connect(CONNECTION_STRING, function(err, db) {});
// Mongoose
var mongoose = require("mongoose");
const Schema = mongoose.Schema;
const likeSchema = new Schema({
  stock: { type: String, required: true },
  ip: { type: String, required: true }
})

module.exports = function (app) {
  mongoose.set("useFindAndModify", false);
  mongoose.connect(process.env.DB);
  
  app.route('/api/stock-prices')
    .get(function (req, res){
      const stock = req.query.stock // can be an array: Array.isArray(stock)
      const like = Array.isArray(stock) ? req.query.rel_likes === 'true' : req.query.like === 'true';
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      
      
    
    });
    
};
