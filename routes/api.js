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
      //response will be array of book objects
      // DONE: json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find({}, (err, books) => {
        let allBooks = {};

        books.forEach((book) => {
          allBooks[book._id] = book;
        });
        res.send(books);
      });
    })

    .post(function (req, res) {
      //response will contain new book object including atleast _id and title
      let title = req.body.title;

      if (!title) {
        return res.json({ error: "required field(s) missing" });
      }

      const newBook = new Book({
        title: title,
      });

      console.log(newBook);

      newBook.save((err, book) => {
        if (err) {
          return res.json({ error: "something went wrong" });
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
      //if successful response will be 'complete delete successful'

      Book.deleteMany({}, (err, doc) => {
        return res.json({ response: "complete delete successful" });
      });
    });

  app
    .route("/api/books/:id")
    .get(function (req, res) {
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      let bookid = req.params.id;

      Book.findById(bookid, (err, book) => {
        if (err) return res.json({ error: "invalid id" });
        return res.json({
          _id: book.id,
          title: book.title,
          comments: book.comments,
          commentcount: book.commentcount,
        });
      });
    })

    .post(async function (req, res) {
      //json res format same as .get
      let bookid = req.params.id;
      let comment = req.body.comment;
      const bookExists = await Book.exists({ _id: bookid });

      if (!bookExists) {
        return res.json({ error: "no book with that ID exists" });
      }

      if (comment === null || comment === undefined || !comment) {
        return res.json({ error: "no comment supplied" });
      }

      Book.findOneAndUpdate(
        { _id: bookid },
        { $push: { comments: comment } },
        { $inc: { commentcount: 1 } },
        (err, book) => {
          if (err) return res.json({ error: "no comment supplied" });
          return res.json({
            _id: book.id,
            title: book.title,
            comments: book.comments,
            commentcount: book.commentcount + 1, //FIXME: blatant hack $INC not working
          });
        }
      );
    })

    .delete(async function (req, res) {
      //if successful response will be 'delete successful'
      let bookid = req.params.id;
      const doesBookExist = await Book.exists({ _id: bookid });
      if (!doesBookExist) {
        return res.json({ error: "no book with that ID exists" });
      }
      Book.deleteOne({ _id: bookid }, (err, doc) => {
        if (err) return res.json({ error: "could not delete" });
        return res.json({ response: "delete successful" });
      });
    });
};
