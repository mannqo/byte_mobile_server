const mongoose = require('mongoose');

const FollowerSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    followerId: {
        type: String,
        required: true,
        unique: true,
    },
})

module.exports = mongoose.model('FollowerAndFan', FollowerSchema);