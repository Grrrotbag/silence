const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {

  let test_id;
  const wrong_id = "5eb78994dbb89024f04a2507";

  suite("Routing tests", function () {
    suite("POST /api/books with title => create book object/expect book object", function () {
      test("Test POST /api/books with title", function (done) {
        chai
          .request(server)
          .post("/api/books")
          .send({
            title: "Test Title",
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.title, "Test Title");
            test_id = res.body._id;
            done();
          });
      });

      test("Test POST /api/books with no title given", function (done) {
        chai
          .request(server)
          .post("/api/books")
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, `missing required field title`);
            done();
          });
      });
    });

    suite("GET /api/books => array of books", function () {
      test("Test GET /api/books", function (done) {
        chai
          .request(server)
          .get("/api/books")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, "response should be an array");
            assert.property(res.body[0], 'title');
            assert.property(res.body[0], 'commentcount');
            assert.property(res.body[0], '_id');
            done();
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function () {
      test("Test GET /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .get(`/api/books/${wrong_id}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, `no book exists`);
            done();
          });
      });

      test("Test GET /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .get(`/api/books/${test_id}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.commentcount, 0);
            assert.equal(res.body.title, "Test Title");
            assert.equal(res.body._id, test_id);
            done();
          });
      });
    });

    suite("POST /api/books/[id] => add comment/expect book object with id", function () {
      test("Test POST /api/books/[id] with comment", function (done) {
        chai
          .request(server)
          .post(`/api/books/${test_id}`)
          .send({ comment: "test comment" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.commentcount, 1);
            assert.equal(res.body.title, "Test Title");
            assert.equal(res.body._id, test_id);
            done();
          });
      });

      test("Test POST /api/books/[id] without comment field", function (done) {
        chai
          .request(server)
          .post(`/api/books/${test_id}`)
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, `missing required field comment`);
            done();
          });
      });

      test("Test POST /api/books/[id] with comment, id not in db", function (done) {
        chai
          .request(server)
          .post(`/api/books/${wrong_id}`)
          .send({ comment: "test comment 2" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, `no book exists`);
            done();
          });
      });
    });

    suite("DELETE /api/books/[id] => delete book object id", function () {
      test("Test DELETE /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .delete(`/api/books/${test_id}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, `delete successful`);
            done();
          });
      });

      test("Test DELETE /api/books/[id] with  id not in db", function (done) {
        chai
          .request(server)
          .delete(`/api/books/${wrong_id}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, `no book exists`);
            done();
          });
      });
    });
  });
});
