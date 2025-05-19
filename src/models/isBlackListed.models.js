const mongoose = require("mongoose");

const isblackListedSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    }
}, {timestamps: true})

const BlackListedToken = mongoose.models.BlackListToken || mongoose.model("BlackListToken", isblackListedSchema);

module.exports = BlackListedToken