/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http')
var chai = require('chai')
var assert = chai.assert
var server = require('../server')

const Like = require('../models/like')

const sample_data = [
  { stock: 'GOOG', ip: '127.0.0.5' },
  { stock: 'GOOG', ip: '127.0.0.6' },
  { stock: 'GOOG', ip: '127.0.0.7' },
  { stock: 'GOOG', ip: '127.0.0.8' },
  { stock: 'GOOG', ip: '127.0.0.15' },
  { stock: 'MSFT', ip: '127.0.0.16' },
  { stock: 'MSFT', ip: '127.0.0.17' },
  { stock: 'MSFT', ip: '127.0.0.18' }
]

chai.use(chaiHttp)

suite('Functional Tests', function() {

  before(done => {
    Like.deleteMany({}, err => {
      if(err) console.log('error removing data', err)
      else console.log('data removed')
      Like.insertMany(sample_data, (err, stocks) => {
        if(err) console.log('error inserting data', err)
        else console.log('data inserted', stocks.length)
        done()
      })
    })
  })

  after(done => {
    Like.deleteMany({}, err => {
      if(err) console.log('error removing data', err)
      else console.log('data removed')
      done()
    })
  })

  suite('GET /api/stock-prices => stockData object', function() {

    test('1 stock', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog' })
        .end(function(err, res){
          assert.equal(res.status, 200)
          assert.property(res.body, 'stockData', 'response should contain stockData')
          assert.property(res.body.stockData, 'stock', 'stockData should contain stock')
          assert.property(res.body.stockData, 'price', 'stockData should contain price')
          assert.property(res.body.stockData, 'likes', 'stockData should contain likes')
          assert.equal(res.body.stockData.stock, 'GOOG')

          done()
        })
    })

    test('1 stock with like', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog', like: true })
        .end(function(err, res){
          assert.equal(res.status, 200)
          assert.property(res.body, 'stockData', 'response should contain stockData')
          assert.property(res.body.stockData, 'stock', 'stockData should contain stock')
          assert.property(res.body.stockData, 'price', 'stockData should contain price')
          assert.property(res.body.stockData, 'likes', 'stockData should contain likes')
          assert.equal(res.body.stockData.stock, 'GOOG')
          assert.equal(res.body.stockData.likes, 6)
          done()
        })
    })

    test('1 stock with like again (ensure likes arent double counted)', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog', like: true })
        .end(function(err, res){
          assert.equal(res.status, 200)
          assert.property(res.body, 'stockData', 'response should contain stockData')
          assert.property(res.body.stockData, 'stock', 'stockData should contain stock')
          assert.property(res.body.stockData, 'price', 'stockData should contain price')
          assert.property(res.body.stockData, 'likes', 'stockData should contain likes')
          assert.equal(res.body.stockData.stock, 'GOOG')
          assert.equal(res.body.stockData.likes, 6)

          done()
        })

    })

    test('2 stocks', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: ['goog', 'msft'] })
        .end(function(err, res){
          assert.equal(res.status, 200)
          assert.property(res.body, 'stockData', 'response should contain stockData')
          assert.isArray(res.body.stockData, 'stockData should be Array')
          assert.property(res.body, 'stockData', 'response should contain stockData')
          assert.property(res.body.stockData[0], 'stock', 'stockData should contain stock')
          assert.property(res.body.stockData[0], 'price', 'stockData should contain price')
          assert.property(res.body.stockData[0], 'rel_likes', 'stockData should contain rel_likes')
          assert.equal(res.body.stockData[0].stock, 'GOOG')
          assert.equal(res.body.stockData[0].rel_likes, 3)
          assert.equal(res.body.stockData[1].stock, 'MSFT')
          assert.equal(res.body.stockData[1].rel_likes, 3)

          done()
        })

    })

    test('2 stocks with like', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: ['goog', 'msft'], like: true })
        .end(function(err, res){
          assert.equal(res.status, 200)
          assert.property(res.body, 'stockData', 'response should contain stockData')
          assert.isArray(res.body.stockData, 'stockData should be Array')
          assert.property(res.body, 'stockData', 'response should contain stockData')
          assert.property(res.body.stockData[0], 'stock', 'stockData should contain stock')
          assert.property(res.body.stockData[0], 'price', 'stockData should contain price')
          assert.property(res.body.stockData[0], 'rel_likes', 'stockData should contain likes')
          assert.equal(res.body.stockData[0].stock, 'GOOG')
          assert.equal(res.body.stockData[0].rel_likes, 3)
          assert.equal(res.body.stockData[1].stock, 'MSFT')
          assert.equal(res.body.stockData[1].rel_likes, 3)

          done()
        })


    })

  })

})
