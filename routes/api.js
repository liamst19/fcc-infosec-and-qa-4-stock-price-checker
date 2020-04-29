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

'use strict'

const expect = require('chai').expect
const axios = require('axios')

const Like = require('../models/like')

// Get Stock data from external api
const getStockDataFromAPI = async stocks => {
  const apiStockData = await axios.all(stocks.map(stock => axios.get(`https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`)))

  return apiStockData.reduce((infos, res) => {
    return res.status === 200
      ? infos.concat({
        stock: res.data.symbol,
        price: res.data.latestPrice
      })
      : infos
  }, [])
}

module.exports = app => {

  app.route('/api/stock-prices').get( async (req, res) => {

    const stocks = req.query.stock
      ? Array.isArray(req.query.stock)
        ? req.query.stock
        : [req.query.stock]
      : null // can be an array: Array.isArray(stock)
    const like = req.query.like === 'true'
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

    if (!stocks || stocks.length < 1) res.status(400).send('no stock specified')

    // Get stock info from external api
    const stockInfos = await getStockDataFromAPI(stocks)

    // Get Likes from Database
    const stockLikes = await Promise.all(stockInfos.map(info => Like.find({ stock: info.stock }).exec()))

    // Reduce responses to an array of individual stocks and their counts
    const likesCounts = stockLikes.reduce((stocks, res) => {
      return res && res.length > 0 ? stocks.concat({ stock: res[0].stock, count: res.length }) :stocks
    }, [])

    // Checks whether the stock has already been 'liked' by the ip
    const alreadyLiked = stock => {
      return stock && stockLikes.some(res => res[0] && res[0].stock === stock && res.some(l => l.ip === ip))
    }

    // Gets the number of likes, incremented if the request included 'like=true'
    const getLikesCount = (info) => {
      const incr = like && info && !alreadyLiked(info.stock) ? 1 : 0
      const stock = info ? likesCounts.filter(s => s.stock === info.stock)[0] : null
      return stock ? stock.count + incr : incr
    }

    // calculate rel_likes
    const countArray = likesCounts.map(s => s.count)
    const rel_likes = Math.max(...countArray) - Math.min(...countArray)

    // Save stock/ip if query included 'like=true'
    if(like){
      await Promise.all(stockInfos.map(info =>  {
        return Like.findOneAndUpdate(
          { stock: info.stock, ip },
          { stock: info.stock, ip },
          { upsert: true }
        ).exec()
      }))
    }

    return res.json({
      stockData:
      stockInfos.length === 1
        ? { ...stockInfos[0], likes: getLikesCount(stockInfos[0]) }
        : stockInfos.map(info => ({ stock: info.stock, price: info.price, rel_likes }))
    })
  })
}
