/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  /*
  * ----[END of EXAMPLE TEST]----
  */

  let test_id;

  suite('Routing tests', function() {

    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({
            title: "Test Title",
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body, 'commentcount', 'Books in array should contain commentcount');
            assert.property(res.body, 'title', 'Books in array should contain title');
            assert.equal(res.body, 'title', "Test title")
            assert.property(res.body, '_id', 'Books in array should contain _id');
            test_id = res.body._id;
            done();
          });
      })
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, `{"error":"required field(s) missing"}`);
            done();
        });
      });
    })


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.equal(res.body[0], 'commentcount', 0);
            assert.equal(res.body[0], 'title', 'Test title');
            assert.equal(res.body[0], '_id', test_id);
            done();
          });
      });
    })


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get('/api/books/1234')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, `{"error":"invalid id"}`);
            done();
          }); 
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
          .get(`/api/books/${test_id}`)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body[0], 'commentcount', 0);
            assert.equal(res.body[0], 'title', 'Test title');
            assert.equal(res.body[0], '_id', test_id);
            done();
        }); 
      });
    })


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
          .post(`/api/books/${test_id}`)
          .send({ comment: "test comment" })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body, 'commentcount', 1);
            assert.equal(res.body, 'title', 'Test title');
            assert.equal(res.body, '_id', test_id);
            done();
        });
      })

      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server)
          .post(`/api/books/${test_id}`)
          .send({ })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, `{'error':'no comment supplied'}`);
            done();
        });
      })

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai.request(server)
          .post(`/api/books/12345}`)
          .send({ comment: 'test comment 2' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, `{'error':'no book with that ID exists'}`);
            done();
        });
      })  
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai.request(server)
          .post(`/api/books/${test_id}}`)
          .send({ comment: 'test comment 2' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, `{'delete successful'}`);
            done();
        });
      })

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        chai.request(server)
          .post(`/api/books/12345}`)
          .send({ comment: 'test comment 2' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, `{'error':'no book with that ID exists'}`);
            done();
      });

    });

  });

});
