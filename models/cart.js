const mongoose = require("mongoose");

let schema = new mongoose.Schema({
    recipient_name: {
        type: String,
        required: true
    },
    line1: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    postal_code: {
        type: String,
        required: true
    },
    country_code: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    seller_email: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    book: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    }
});

let modal = mongoose.model("cart", schema);
module.exports = modal;
