const mongoose = require('mongoose');

const FollowerSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
})

module.exports = mongoose.model('FollowerAndFan', FollowerSchema);