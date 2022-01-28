const mongoose = require('mongoose');

const LikeAndStarSchema = mongoose.Schema({
    userId: {
        type: Number,
        required: true,
        unique: true,
    },
    articleId: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('likeAndStar', LikeAndStarSchema);