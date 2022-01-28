const mongoose = require('mongoose');

const FollowerSchema = mongoose.Schema({
    userId: {
        type: Number,
        required: true,
        unique: true,
    },
    followerId: {
        type: Number,
        required: true,
        unique: true,
    },
})

module.exports = mongoose.model('FollowerAndFan', FollowerSchema);