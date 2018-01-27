const mongoose = require("mongoose");

let booksSchema = new mongoose.Schema({
    title: {type: String, required: true},
    image: {type: String, required: true},
    description: {type: String, required: true},
    email: {type: String, required: true},
    price: {type: Number, required: true},
    category: {type: String, required: true},
    posted_by: {type: String, required: true},
    sold: {type: String, required: true}
});

let books = mongoose.model("Books", booksSchema);
module.exports = books;

