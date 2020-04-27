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

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb");
var axios = require("axios");

//const CONNECTION_STRING = process.env.DB;
//MongoClient.connect(CONNECTION_STRING, function(err, db) {});
// Mongoose
var mongoose = require("mongoose");
const Schema = mongoose.Schema;
const likeSchema = new Schema({
  stock: { type: String, required: true },
  ip: { type: String, required: true }
});
const Like = mongoose.model("Like", likeSchema);

module.exports = app => {
  mongoose.set("useFindAndModify", false);
  mongoose.connect(process.env.DB);

  app.route("/api/stock-prices").get((req, res) => {
    const stocks = req.query.stock
      ? Array.isArray(req.query.stock)
        ? req.query.stock
        : [req.query.stock]
      : null; // can be an array: Array.isArray(stock)
    const like = req.query.like === "true";
    const ip = req.connection.remoteAddress;

    if (!stocks || stocks.length < 1)
      res.status(400).send("no stock specified");

    const handleApiResponses = responses => {
      // Get all the successful stock infos
      const stockInfos = responses.reduce((infos, res) => {
        return res.status === 200
          ? infos.concat({
              stock: res.data.symbol,
              price: res.data.latestPrice
            })
          : infos;
      }, []);

      // Access the database for likes
      const handleDbFindResponses = responses => {
        
        const likesCounts = responses.reduce((arr, res) => {
          return res && res.length > 0 ? arr.concat({ stock: res[0].stock, count: res.length}) : arr;
        }, []);
        
        const getLikesCount = (info) => {
          const stock = info ? likesCounts.filter(s => s.stock === info.stock)[0] : null;
          return stock ? stock.count : 0;
        }
        
        const cntArr = likesCounts.map(s => s.count)
        const relLikes = Math.max(...cntArr) - Math.min(...cntArr)
        
        console.log('find', likesCounts);
        if (like) {
          // Save stock / increment likes
          Promise
            .all(stockInfos.map(info =>  Like.findOneAndUpdate(
                                            { stock: info.stock, ip },
                                            { stock: info.stock, ip },
                                            { upsert: true }
                                          ).exec()
            ))
            .then(responses => {
              console.log('findOneAndUpdate', responses)
              
              return res.json({
                stockData:
                  stockInfos.length === 1
                    ? { ...stockInfos[0], likes: getLikesCount(stockInfos[0]) + 1 }
                    : stockInfos.map(info => ({ stock: info.stock, price: info.price, rel_likes: relLikes}))
              });
          })
        } else {
          // Use the likes from responses, 0 if null
          return res.json({
            stockData:
              stockInfos.length === 1
                ? { ...stockInfos[0], likes: getLikesCount(stockInfos[0]) }
                : stockInfos.map(info => ({ stock: info.stock, price: info.price, rel_likes: relLikes }))
          });
        }
      };
      
      Promise.all(
        stockInfos.map(info => Like.find({ stock: info.stock }).exec())
      ).then(handleDbFindResponses);
    };

    // Get stock info from api
    axios
      .all(
        stocks.map(stock =>
          axios.get(`https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`)
        )
      )
      .then(handleApiResponses);
  });
};
