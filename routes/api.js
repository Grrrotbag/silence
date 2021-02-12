"use strict";

const expect = require("chai").expect;
require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");

// =============================================================================
// Config
// =============================================================================
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
  console.log("Database connection status: ", mongoose.connection.readyState);
});

const { Schema } = mongoose;

const BookSchema = new Schema({
  title: { type: String, required: true },
  // add comments to array of comments and count
  comments: [],
  commentcount: { type: Number, default: 0 },
});

let Book = mongoose.model("Book", BookSchema);

// =============================================================================
// API Routes
// =============================================================================
module.exports = function (app) {
  app
    .route("/api/books")
    .get(function (req, res) {
      
      Book.find({}, (err, books) => {
        let allBooks = {};

        books.forEach((book) => {
          allBooks[book._id] = book;
        });
        res.send(books);
      });
    })

    .post(function (req, res) {
      let title = req.body.title;

      if (!title) {
        return res.send("missing required field title");
      }

      const newBook = new Book({
        title: title,
      });

      console.log(newBook);

      newBook.save((err, book) => {
        if (err) {
          return res.send("something went wrong");
        }

        return res.json({
          _id: book._id,
          title: book.title,
          commentcount: book.commentcount,
          comments: book.comments,
        });
      });
    })

    .delete(function (req, res) {
      Book.deleteMany({}, (err, doc) => {
        return res.send("complete delete successful");
      });
    });

  app
    .route("/api/books/:id")
    .get(async function (req, res) {
      let bookid = req.params.id;

      const bookExists = await Book.exists({ _id: bookid });

      if (!bookExists) {
        return res.send("no book exists");
      }

      Book.findById(bookid, (err, book) => {
        if (err) return res.send("no book exists");
        return res.json({
          _id: book.id,
          title: book.title,
          comments: book.comments,
          commentcount: book.commentcount,
        });
      });
    })

    .post(async function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;

      const bookExists = await Book.exists({ _id: bookid });

      if (!bookExists) {
        return res.send("no book exists");
      }

      if (comment === null || comment === undefined || !comment) {
        return res.send("missing required field comment");
      }

      Book.findOneAndUpdate(
        { _id: bookid },
        { $push: { comments: comment } },
        { 'new': true},
        (err, book) => {
          if (err) return res.send("missing required field comment");
          return res.json({
            _id: book.id,
            title: book.title,
            comments: book.comments,
            commentcount: book.comments.length,
          });
        }
      );
    })

    .delete(async function (req, res) {
      let bookid = req.params.id;
      const doesBookExist = await Book.exists({ _id: bookid });
      if (!doesBookExist) {
        return res.send("no book exists");
      }
      Book.deleteOne({ _id: bookid }, (err, doc) => {
        if (err) return res.json({ error: "could not delete" });
        return res.send("delete successful");
      });
    });
};
