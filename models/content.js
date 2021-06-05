const mongoose = require("mongoose");

const ContentSchema = new mongoose.Schema(
    {
        body: {
            type: String,
            required: true
        },
        tags: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    { strict: false }
);

module.exports = Content = mongoose.model("content", ContentSchema);