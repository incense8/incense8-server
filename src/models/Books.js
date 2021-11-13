const mongoose = require("mongoose");
const schema = mongoose.Schema;

const Books = new schema({
  BookName: {
    type: String,
    require: true,
    trim: true,
  },
  Author: {
    type: String,
    require: true,
    trim: true,
  },
  BookFor: {
    type: String,
    require: true,
    trim: true,
  },
  sem: {
    type: String,
    require: true,
    trim: true,
  },
});

const Book = mongoose.model("Book", Books);

module.exports = { Book };
