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
});
const Like = mongoose.model('Like', likeSchema);

module.exports = (app) => {
  mongoose.set("useFindAndModify", false);
  mongoose.connect(process.env.DB);
  
  app.route('/api/stock-prices')
    .get((req, res) => {
      const stocks = req.query.stock ? Array.isArray(req.query.stock) ? req.query.stock : [req.query.stock] : null; // can be an array: Array.isArray(stock)
      const like = req.query.like === 'true';
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      
      if(!stocks || stocks.length < 1) res.status(400).send('no stock specified');
    
      const getPromises = stocks.map(stock => {
        return axios.get(`https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`);
      });
      axios
        .all(getPromises)
        .then((...responses) => {
          console.log(responses)
          const infos = responses.reduce((infos, res) => {
            console.log(res.data)
            return res.status === 200 ? infos.concat(res.data) : infos;            
          }, []);
          console.log('infos', infos);
          return res.json(infos);
        })
    });
    
};
