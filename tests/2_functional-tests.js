/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData', 'response should contain stockData')
          assert.property(res.body.stockData, 'stock', 'stockData should contain stock')
          assert.property(res.body.stockData, 'price', 'stockData should contain price')
          assert.property(res.body.stockData, 'likes', 'stockData should contain likes')
          assert.equal(res.body.stockData.stock, 'GOOG');
                   
          done();
        });
      });
      
      let likes = 0;
      
      test('1 stock with like', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true })
        .end(function(err, res){
         console.log('like 1', res.body)
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData', 'response should contain stockData')
          assert.property(res.body.stockData, 'stock', 'stockData should contain stock')
          assert.property(res.body.stockData, 'price', 'stockData should contain price')
          assert.property(res.body.stockData, 'likes', 'stockData should contain likes')
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.equal(res.body.stockData.likes, 1);  
           likes = res.body.stockData.likes;
          done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true })
        .end(function(err, res){
         console.log('like 2', res.body)
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData', 'response should contain stockData')
          assert.property(res.body.stockData, 'stock', 'stockData should contain stock')
          assert.property(res.body.stockData, 'price', 'stockData should contain price')
          assert.property(res.body.stockData, 'likes', 'stockData should contain likes')
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.equal(res.body.stockData.likes, likes);
                    
          done();
        });
        
      });
      
      test('2 stocks', function(done) {
        
      });
      
      test('2 stocks with like', function(done) {
        
      });
      
    });

});
