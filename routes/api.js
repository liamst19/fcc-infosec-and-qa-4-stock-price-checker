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

module.exports = app => {

  app.route('/api/stock-prices').get( async (req, res) => {

    const stocks = req.query.stock
      ? Array.isArray(req.query.stock)
        ? req.query.stock
        : [req.query.stock]
      : null // can be an array: Array.isArray(stock)
    const like = req.query.like === 'true'
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

    if (!stocks || stocks.length < 1)
      res.status(400).send('no stock specified')

    const apiResponses = await axios.all(stocks.map(stock => axios.get(`https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`)))

    // Get all the successful stock infos
    const stockInfos = apiResponses.reduce((infos, res) => {
      return res.status === 200
        ? infos.concat({
          stock: res.data.symbol,
          price: res.data.latestPrice
        })
        : infos
    }, [])

    console.log('find data from db')
    const dbFindResponses = await Promise.all(stockInfos.map(info => Like.find({ stock: info.stock }).exec()))

    // Reduce responses to an array of individual stocks and their counts
    const likesCounts = dbFindResponses.reduce((stocks, res) => {
      return res && res.length > 0 ? stocks.concat({ stock: res[0].stock, count: res.length }) :stocks
    }, [])

    const alreadyLiked = stock => {
      return stock && dbFindResponses.some(res => res[0] && res[0].stock === stock && res.some(l => l.ip === ip))
    }

    const getLikesCount = (info) => {
      const incr = like && info && !alreadyLiked(info.stock) ? 1 : 0
      const stock = info ? likesCounts.filter(s => s.stock === info.stock)[0] : null
      return stock ? stock.count + incr : incr
    }

    const cntArr = likesCounts.map(s => s.count)
    const relLikes = Math.max(...cntArr) - Math.min(...cntArr)

    if(like){ // save stock/ip to db and return incremented
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
        : stockInfos.map(info => ({ stock: info.stock, price: info.price, rel_likes: relLikes }))
    })
  })
}
